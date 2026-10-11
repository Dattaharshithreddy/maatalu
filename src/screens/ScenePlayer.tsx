import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { F, useTheme } from '../theme';
import { Btn } from '../ui';
import { useStore } from '../store';
import { playUri, Role, speakRole, stopAll, useVoiceRecorder } from '../audio';
import SceneCanvas from '../stories/SceneCanvas';
import { Portrait } from '../stories/Actor';
import { CHAPTERS, personalise } from '../stories/scenes';
import type { Gesture, Scene, Who } from '../stories/types';

type Props = { chapterId: string; sceneIndex: number; onClose: () => void; onGo: (index: number) => void };
type Mode = 'idle' | 'watch' | 'turn';

export default function ScenePlayer({ chapterId, sceneIndex, onClose, onGo }: Props) {
  const t = useTheme();
  const ins = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { s, completeScene, toast } = useStore();
  const p = s.profile!;
  const kid = p.kid ?? 'boy';
  const chapter = CHAPTERS.find((c) => c.id === chapterId)!;
  const scene: Scene = chapter.scenes[sceneIndex];
  const lines = scene.lines;

  const [cur, setCur] = useState(-1);
  const [speaking, setSpeaking] = useState<Who | null>(null);
  const [gesture, setGesture] = useState<Gesture | null>(null);
  const [mode, setMode] = useState<Mode>('idle');
  const [waitingKid, setWaitingKid] = useState(false);
  const [happy, setHappy] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive = useRef(true);
  const modeRef = useRef<Mode>('idle');
  const rec = useVoiceRecorder();

  const name = (w: Who) => (w === 'kid' ? p.child : w === 'ammamma' ? p.gma : w === 'tatayya' ? p.gpa : w === 'amma' ? 'Amma' : 'Nanna');
  const role = (w: Who): Role => (w === 'kid' ? kid : w);
  const portrait = (w: Who) => (w === 'kid' ? kid : w);

  const halt = useCallback(() => {
    stopRef.current?.(); stopRef.current = null;
    if (timer.current) clearTimeout(timer.current);
    stopAll();
    setSpeaking(null); setGesture(null); setWaitingKid(false);
    modeRef.current = 'idle'; setMode('idle');
  }, []);

  useEffect(() => { alive.current = true; return () => { alive.current = false; halt(); }; }, [halt]);
  useEffect(() => { halt(); setCur(-1); setHappy(false); }, [sceneIndex, halt]);

  const finish = () => {
    modeRef.current = 'idle'; setMode('idle'); setCur(-1);
    setHappy(true);
    timer.current = setTimeout(() => alive.current && setHappy(false), 2600);
    if (completeScene(scene.id)) toast('Scene complete! +3 ⭐');
  };

  const say = (i: number, then?: () => void) => {
    const L = lines[i];
    setCur(i);
    stopRef.current = speakRole(personalise(L.te, kid, 'te'), role(L.who),
      () => { if (!alive.current) return; setSpeaking(L.who); setGesture(L.g ?? null); },
      () => {
        if (!alive.current) return;
        setSpeaking(null); setGesture(null);
        if (then) timer.current = setTimeout(() => alive.current && then(), 550);
      });
  };

  const step = (i: number) => {
    if (!alive.current || modeRef.current === 'idle') return;
    if (i >= lines.length) return finish();
    if (modeRef.current === 'turn' && lines[i].who === 'kid') {
      setCur(i); setWaitingKid(true);
      return;
    }
    say(i, () => step(i + 1));
  };

  const start = (m: Mode) => { halt(); setHappy(false); modeRef.current = m; setMode(m); timer.current = setTimeout(() => step(0), 250); };

  // Child's turn: hold to record, release to hear their own voice come out of their character.
  const holdStart = () => { if (waitingKid) rec.start(); };
  const holdEnd = async () => {
    if (!waitingKid) return;
    const r = await rec.stop(`line-${Date.now()}`, false);
    if (r === 'denied') { toast('Allow the microphone to record your turn'); return; }
    if (r === 'too-short' || !r) { toast('Hold the button while you speak'); return; }
    const i = cur;
    setWaitingKid(false);
    setSpeaking('kid'); setGesture(lines[i].g ?? null);
    playUri(r.uri, () => {
      if (!alive.current) return;
      setSpeaking(null); setGesture(null);
      timer.current = setTimeout(() => step(i + 1), 500);
    });
  };
  const skipTurn = () => { const i = cur; setWaitingKid(false); say(i, () => step(i + 1)); };

  const canvasW = Math.min(width, 720);
  const line = cur >= 0 ? lines[cur] : null;
  const done = s.scenesDone.includes(scene.id);
  const hasKidLine = lines.some((l) => l.who === 'kid');

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={[st.top, { paddingTop: ins.top + 8 }]}>
        <Pressable onPress={() => { halt(); onClose(); }} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
          <Text style={{ fontFamily: F.bold, color: t.leaf, fontSize: 17 }}>‹ {chapter.title}</Text>
        </Pressable>
        <Text style={{ fontFamily: F.bold, color: t.muted }}>{sceneIndex + 1} / {chapter.scenes.length}{done ? '  ⭐' : ''}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: ins.bottom + 30 }}>
        <View style={{ alignItems: 'center' }}>
          <View style={[st.canvas, { borderColor: t.line }]}>
            <SceneCanvas scene={scene} width={canvasW - 4} kid={kid} speaking={speaking} gesture={gesture} happy={happy} />
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 12, marginTop: 12 }}>
          <Text style={[st.title, { color: t.ink }]}>{scene.te}</Text>
          <Text style={{ fontFamily: F.bold, color: t.muted, marginTop: -10 }}>{scene.title}</Text>

          <View style={[st.now, { backgroundColor: waitingKid ? t.turmericSoft : t.surface, borderColor: waitingKid ? t.turmeric : t.line }]}>
            {line ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Portrait id={portrait(line.who)} size={36} />
                  <Text style={{ fontFamily: F.bold, color: t.kumkum, fontSize: 14 }}>
                    {waitingKid ? `Your turn, ${p.child}! Hold the mic and say:` : name(line.who)}
                  </Text>
                </View>
                <Text style={[st.te, { color: t.ink }]}>{personalise(line.te, kid, 'te')}</Text>
                <Text style={{ fontFamily: F.bold, color: t.kumkum }}>{personalise(line.tl, kid, 'tl')}</Text>
                <Text style={{ fontFamily: F.body, color: t.muted }}>{personalise(line.en, kid, 'en')}</Text>
              </>
            ) : (
              <>
                <Text style={{ fontFamily: F.bold, color: t.ink, fontSize: 16 }}>{happy ? 'భలే! Well done!' : 'Watch the scene, then play your part.'}</Text>
                <Text style={{ fontFamily: F.body, color: t.muted }}>Tap any character to make them jump.</Text>
              </>
            )}
          </View>

          {waitingKid ? (
            <View style={{ gap: 10 }}>
              <Pressable onPressIn={holdStart} onPressOut={holdEnd} accessibilityRole="button" accessibilityLabel="Hold to record"
                style={[st.mic, { backgroundColor: rec.recording ? t.kumkum : t.leaf }]}>
                <Text style={{ fontSize: 30 }}>🎤</Text>
                <Text style={{ fontFamily: F.bold, color: '#fff', fontSize: 17 }}>{rec.recording ? 'Listening… let go when done' : 'Hold to say it'}</Text>
              </Pressable>
              <Pressable onPress={skipTurn} hitSlop={8} style={{ alignSelf: 'center' }}>
                <Text style={{ fontFamily: F.bold, color: t.muted }}>Hear it first</Text>
              </Pressable>
            </View>
          ) : mode === 'idle' ? (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Btn label="▶ Watch" variant="leaf" style={{ flex: 1 }} onPress={() => start('watch')} />
              {hasKidLine && <Btn label="🎤 Your turn" style={{ flex: 1 }} onPress={() => start('turn')} />}
            </View>
          ) : (
            <Btn label="■ Stop" variant="ghost" onPress={halt} />
          )}

          <View style={{ gap: 8, marginTop: 4 }}>
            {lines.map((L, i) => (
              <Pressable key={i} onPress={() => { halt(); say(i); }} accessibilityRole="button" accessibilityLabel={`Play line ${i + 1}`}
                style={[st.line, { backgroundColor: t.surface, borderColor: cur === i ? t.turmeric : t.line }]}>
                <Portrait id={portrait(L.who)} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: F.te, color: t.ink, fontSize: 18 }}>{personalise(L.te, kid, 'te')}</Text>
                  <Text style={{ fontFamily: F.body, color: t.muted, fontSize: 13 }}>{personalise(L.en, kid, 'en')}</Text>
                </View>
                <Text style={{ color: t.leaf, fontSize: 18 }}>▶</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
            <Btn label="‹ Previous" variant="ghost" style={{ flex: 1 }} disabled={sceneIndex === 0} onPress={() => { halt(); onGo(sceneIndex - 1); }} />
            <Btn label="Next scene ›" variant={done ? 'primary' : 'ghost'} style={{ flex: 1 }} disabled={sceneIndex >= chapter.scenes.length - 1}
              onPress={() => { halt(); onGo(sceneIndex + 1); }} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  canvas: { borderWidth: 2, borderRadius: 18, overflow: 'hidden' },
  title: { fontFamily: F.teHeavy, fontSize: 26 },
  now: { borderWidth: 2, borderRadius: 18, padding: 14, gap: 4, minHeight: 130 },
  te: { fontFamily: F.teHeavy, fontSize: 24 },
  mic: { borderRadius: 20, paddingVertical: 18, alignItems: 'center', gap: 4 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 2, borderRadius: 16, padding: 10 },
});
