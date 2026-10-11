import { useRef, useState } from 'react';
import * as Speech from 'expo-speech';
import {
  createAudioPlayer, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, RecordingPresets,
} from 'expo-audio';
import { Directory, File, Paths } from 'expo-file-system';
import type { Speaker, Word } from './content';

type Player = ReturnType<typeof createAudioPlayer>;
let current: Player | null = null;
let voiceChecked = false;
let haveTelugu = false;
let distinct = false;
const voiceId: Partial<Record<Speaker, string>> = {};

/**
 * Finds Telugu voices on the phone and gives Ammamma a female voice and Tatayya a male one.
 * If the phone only has one Telugu voice, pitch makes the two sound different.
 */
export async function checkTeluguVoice(): Promise<boolean> {
  try {
    const all = await Speech.getAvailableVoicesAsync();
    const te = all.filter((v) => v.language?.toLowerCase().replace('_', '-').startsWith('te'));
    const tag = (v: Speech.Voice) => `${v.identifier} ${v.name}`.toLowerCase();
    const isF = (v: Speech.Voice) => /\b(tef|female|woman)\b/.test(tag(v));
    const isM = (v: Speech.Voice) => /\b(tem|male|man)\b/.test(tag(v));
    const best = (list: Speech.Voice[]) =>
      [...list].sort((a, b) => Number(!tag(a).includes('local')) - Number(!tag(b).includes('local')))[0];
    const f = best(te.filter(isF)), m = best(te.filter(isM)), any = best(te);
    voiceId.gma = (f || any)?.identifier;
    voiceId.gpa = (m || any)?.identifier;
    distinct = !!f && !!m && f.identifier !== m.identifier;
    haveTelugu = te.length > 0;
  } catch { haveTelugu = false; }
  voiceChecked = true;
  return haveTelugu;
}
export const hasTeluguVoice = () => !voiceChecked || haveTelugu;

const PROFILE = (who: Speaker) =>
  who === 'gma'
    ? { pitch: distinct ? 1.08 : 1.28, rate: 0.82 }
    : { pitch: distinct ? 0.92 : 0.78, rate: 0.78 };

export function stopAll() {
  Speech.stop();
  if (current) {
    try { current.pause(); current.remove(); } catch {}
    current = null;
  }
}

/** Robot voice: female for Ammamma, male for Tatayya. */
export function speakAs(text: string, who: Speaker, onEnd?: () => void) {
  stopAll();
  const { pitch, rate } = PROFILE(who);
  Speech.speak(text, {
    language: 'te-IN', voice: voiceId[who], pitch, rate,
    onDone: onEnd, onStopped: onEnd, onError: () => onEnd?.(),
  });
}

export type Role = 'ammamma' | 'tatayya' | 'amma' | 'nanna' | 'boy' | 'girl';

/** Robot voices for the story characters. Women and children use the female voice, men the male one. */
const ROLE: Record<Role, { v: Speaker; pitch: () => number; rate: number }> = {
  ammamma: { v: 'gma', pitch: () => PROFILE('gma').pitch, rate: 0.82 },
  tatayya: { v: 'gpa', pitch: () => PROFILE('gpa').pitch, rate: 0.78 },
  amma: { v: 'gma', pitch: () => (distinct ? 1.15 : 1.35), rate: 0.9 },
  nanna: { v: 'gpa', pitch: () => (distinct ? 1.0 : 0.88), rate: 0.88 },
  boy: { v: 'gma', pitch: () => 1.45, rate: 0.95 },
  girl: { v: 'gma', pitch: () => 1.65, rate: 0.95 },
};

/**
 * Says a story line in the character's robot voice. Calls onStart when sound begins and onEnd when it stops.
 * With no Telugu voice on the phone it stays silent for about as long as the line would take, so the
 * characters still "talk" and the scene keeps moving.
 */
export function speakRole(text: string, role: Role, onStart?: () => void, onEnd?: () => void) {
  stopAll();
  const r = ROLE[role];
  let ended = false;
  const end = () => { if (!ended) { ended = true; onEnd?.(); } };
  if (voiceChecked && !haveTelugu) {
    onStart?.();
    const t = setTimeout(end, 700 + text.length * 75);
    return () => { clearTimeout(t); end(); };
  }
  const startedAt = Date.now();
  Speech.speak(text, {
    language: 'te-IN', voice: voiceId[r.v], pitch: r.pitch(), rate: r.rate,
    onStart: () => onStart?.(),
    onDone: () => {
      // Some engines finish instantly when they cannot speak Telugu: keep the mouth moving a moment.
      const left = 600 + text.length * 60 - (Date.now() - startedAt);
      if (left > 300 && Date.now() - startedAt < 400) setTimeout(end, left); else end();
    },
    onStopped: end,
    onError: () => { onStart?.(); setTimeout(end, 700 + text.length * 75); },
  });
  return () => { Speech.stop(); end(); };
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

export const fileExists = (uri: string) => { try { return new File(uri).exists; } catch { return false; } };

/** Which kind of voice will say this word: the family's real recording, or the robot. */
export const hasRealVoice = (w: Word, who: Speaker, voices: Record<string, Partial<Record<Speaker, string>>>) => {
  const uri = voices[w.id]?.[who];
  return !!uri && fileExists(uri);
};

/** Real recording if the grandparent has made one for this word, otherwise their robot voice. */
export function playWord(w: Word, who: Speaker, voices: Record<string, Partial<Record<Speaker, string>>>, onEnd?: () => void) {
  const uri = voices[w.id]?.[who];
  if (uri && fileExists(uri)) playUri(uri, onEnd); else speakAs(w.te, who, onEnd);
}

/** Plays words one by one with a short pause between. Returns a function that stops it. */
export function playSequence(
  items: { w: Word; who: Speaker }[],
  voices: Record<string, Partial<Record<Speaker, string>>>,
  onStep?: (i: number) => void,
  onDone?: () => void,
) {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const run = (i: number) => {
    if (stopped) return;
    if (i >= items.length) { onDone?.(); return; }
    onStep?.(i);
    playWord(items[i].w, items[i].who, voices, () => { if (!stopped) timer = setTimeout(() => run(i + 1), 1100); });
  };
  run(0);
  return () => { stopped = true; if (timer) clearTimeout(timer); stopAll(); };
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

/** Copies a picked audio file into the app's own storage so it survives cache clean-ups. */
export function importVoiceFile(srcUri: string, id: string): string | null {
  try {
    const dir = new Directory(Paths.document, 'voices');
    dir.create({ idempotent: true });
    const ext = (srcUri.split('?')[0].match(/\.[a-z0-9]{2,5}$/i)?.[0] ?? '.m4a').toLowerCase();
    const dest = new File(dir, `${id}${ext}`);
    new File(srcUri).copySync(dest);
    return dest.uri;
  } catch { return null; }
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

  const stop = async (id: string, keep = true): Promise<RecordResult> => {
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
    return { uri: keep ? persist(uri, id) : uri, seconds: Math.max(1, Math.round(ms / 1000)) };
  };

  return { recording, start, stop };
}

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
