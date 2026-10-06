import { useRef, useState } from 'react';
import * as Speech from 'expo-speech';
import {
  createAudioPlayer, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, RecordingPresets,
} from 'expo-audio';
import { Directory, File, Paths } from 'expo-file-system';
import type { Word } from './content';

type Player = ReturnType<typeof createAudioPlayer>;
let current: Player | null = null;
let teluguVoice: string | undefined;
let voiceChecked = false;

export async function checkTeluguVoice(): Promise<boolean> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const v = voices.find((x) => x.language?.toLowerCase().startsWith('te'));
    teluguVoice = v?.identifier;
    voiceChecked = true;
    return !!v;
  } catch { voiceChecked = true; return false; }
}
export const hasTeluguVoice = () => !voiceChecked || !!teluguVoice;

export function stopAll() {
  Speech.stop();
  if (current) {
    try { current.pause(); current.remove(); } catch {}
    current = null;
  }
}

export function speak(text: string, onEnd?: () => void) {
  stopAll();
  Speech.speak(text, {
    language: 'te-IN', voice: teluguVoice, rate: 0.85,
    onDone: onEnd, onStopped: onEnd, onError: () => onEnd?.(),
  });
}

export function playUri(uri: string, onEnd?: () => void) {
  stopAll();
  try {
    const p = createAudioPlayer(uri);
    current = p;
    const sub = p.addListener('playbackStatusUpdate', (st) => {
      if (st.didJustFinish) {
        sub.remove();
        try { p.remove(); } catch {}
        if (current === p) current = null;
        onEnd?.();
      }
    });
    p.play();
  } catch { onEnd?.(); }
}

export function playWord(w: Word, wordVoices: Record<string, string>, onEnd?: () => void) {
  const uri = wordVoices[w.id];
  if (uri) playUri(uri, onEnd); else speak(w.te, onEnd);
}

export function deleteVoiceFile(uri: string) {
  try { const f = new File(uri); if (f.exists) f.delete(); } catch {}
}

function persist(uri: string, id: string): string {
  try {
    const dir = new Directory(Paths.document, 'voices');
    dir.create({ idempotent: true });
    const src = new File(uri);
    const dest = new File(dir, `${id}.m4a`);
    src.moveSync(dest);
    return src.uri;
  } catch { return uri; }
}

export type RecordResult = { uri: string; seconds: number } | 'denied' | 'too-short' | null;

/** Hold-to-record helper. start() on press-in, stop() on press-out. */
export function useVoiceRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [recording, setRecording] = useState(false);
  const starting = useRef<Promise<boolean> | null>(null);
  const startedAt = useRef(0);

  const start = () => {
    stopAll();
    starting.current = (async () => {
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) return false;
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      startedAt.current = Date.now();
      setRecording(true);
      return true;
    })().catch(() => false);
    return starting.current;
  };

  const stop = async (id: string): Promise<RecordResult> => {
    if (!starting.current) return null;
    const ok = await starting.current;
    starting.current = null;
    if (!ok) return 'denied';
    const ms = Date.now() - startedAt.current;
    try { await recorder.stop(); } catch {}
    setRecording(false);
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
    const uri = recorder.uri;
    if (!uri) return null;
    if (ms < 800) { deleteVoiceFile(uri); return 'too-short'; }
    return { uri: persist(uri, id), seconds: Math.max(1, Math.round(ms / 1000)) };
  };

  return { recording, start, stop };
}

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
