import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { F, useTheme } from '../theme';
import { Btn, Muggulu } from '../ui';
import { ALL_WORDS, LESSON_SIZE, UNITS, Word, isLetter, shuffle } from '../content';
import { useStore } from '../store';
import { hasTeluguVoice, playWord, stopAll } from '../audio';

export type LessonMode = { kind: 'unit'; index: number } | { kind: 'review' };
type Step = { t: 'learn'; w: Word } | { t: 'meaning'; w: Word; opts: Word[] } | { t: 'listen'; w: Word; opts: Word[] } | { t: 'win' };

function buildSteps(mode: LessonMode, learned: string[]): Step[] {
  // Options come from the same kind of item: letters with letters, words with words.
  const opts = (w: Word, pool: Word[]) => {
    const same = pool.filter((x) => x.id !== w.id && isLetter(x) === isLetter(w));
    const extra = ALL_WORDS.filter((x) => x.id !== w.id && isLetter(x) === isLetter(w) && !same.includes(x));
    return shuffle([w, ...shuffle(same).slice(0, 2), ...shuffle(extra)].slice(0, 3));
  };
  const quizFor = (w: Word, pool: Word[], i: number): Step =>
    isLetter(w) || i % 2 ? { t: 'listen', w, opts: opts(w, pool) } : { t: 'meaning', w, opts: opts(w, pool) };

  if (mode.kind === 'review') {
    const known = ALL_WORDS.filter((w) => learned.includes(w.id));
    return [...shuffle(known).slice(0, 6).map((w, i) => quizFor(w, known, i)), { t: 'win' }];
  }
  const u = UNITS[mode.index];
  const fresh = u.words.filter((w) => !learned.includes(w.id)).slice(0, LESSON_SIZE);
  if (fresh.length === 0) {
    // Unit already finished: practise it.
    return [...shuffle(u.words).slice(0, 6).map((w, i) => quizFor(w, u.words, i)), { t: 'win' }];
  }
  return [
    ...fresh.map((w): Step => ({ t: 'learn', w })),
    ...shuffle(fresh).slice(0, Math.min(5, fresh.length)).map((w, i) => quizFor(w, u.words, i)),
    { t: 'win' },
  ];
}

export default function Lesson({ mode, onClose, onShowFamily }: { mode: LessonMode; onClose: () => void; onShowFamily: () => void }) {
  const t = useTheme();
  const ins = useSafeAreaInsets();
  const { s, learn, addStars, finishSession, toast } = useStore();
  const steps = useMemo(() => buildSteps(mode, s.learned), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [k, setK] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<{ stars: number; streak: number } | null>(null);
  const correct = useRef(0);
  const started = useRef(Date.now());
  const step = steps[k];
  const quizTotal = steps.filter((x) => x.t === 'meaning' || x.t === 'listen').length;
  const say = (w: Word) => playWord(w, s.wordVoices);

  useEffect(() => {
    setPicked(null);
    if (step.t === 'learn' || step.t === 'listen') say(step.w);
    if (step.t === 'win' && !result) {
      const mins = Math.max(1, Math.round((Date.now() - started.current) / 60000));
      const learnedNow = steps.filter((x) => x.t === 'learn').length;
      const stars = (learnedNow > 0 ? 5 : 2) + correct.current;
      addStars(stars);
      const streak = finishSession(mins);
      setResult({ stars, streak });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    if (k === 0 && !hasTeluguVoice()) toast('No Telugu voice on this phone. Install Google Text-to-speech Telugu, or record family voices in the Parents tab.');
  }, [k]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stopAll(), []);

  const next = () => {
    if (step.t === 'learn') learn([step.w.id]);
    setK((x) => Math.min(x + 1, steps.length - 1));
  };
  const choose = (o: Word) => {
    if (picked || step.t === 'learn' || step.t === 'win') return;
    setPicked(o.id);
    const ok = o.id === step.w.id;
    if (ok) correct.current += 1;
    Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
    toast(ok ? 'Bhale! That is right ⭐' : 'Almost! The right answer is in green');
  };
  const family = step.t !== 'win' && !!s.wordVoices[step.w.id];

  return (
    <View style={[st.wrap, { backgroundColor: t.bg, paddingTop: ins.top + 10, paddingBottom: ins.bottom + 16 }]}>
      <View style={st.head}>
        <Pressable onPress={onClose} accessibilityLabel="Close lesson" hitSlop={12}><Text style={{ fontSize: 26, color: t.muted }}>✕</Text></Pressable>
        <View style={[st.bar, { backgroundColor: t.line }]}>
          <View style={{ width: `${(k / (steps.length - 1)) * 100}%`, height: '100%', backgroundColor: t.turmeric, borderRadius: 9 }} />
        </View>
      </View>

      <View style={st.stage}>
        {step.t === 'learn' && (
          <View style={[st.card, { backgroundColor: t.surface, borderColor: t.line }]}>
            <Muggulu color={t.dot} size={260} />
            <Text style={{ fontSize: 60, textAlign: 'center' }}>{step.w.e}</Text>
            <Text style={[st.glyph, { color: t.leaf }, step.w.te.length > 10 && st.glyphLong]} adjustsFontSizeToFit numberOfLines={2}>{step.w.te}</Text>
            <Text style={[st.tl, { color: t.ink }]}>{step.w.tl}</Text>
            <Text style={[st.en, { color: t.muted }]}>{step.w.en}</Text>
            <Btn variant="ghost" label={family ? `🔊 Hear ${s.profile?.gma}` : '🔊 Hear it'} onPress={() => say(step.w)} style={{ marginTop: 16, alignSelf: 'center' }} />
          </View>
        )}

        {step.t === 'meaning' && (
          <>
            <Text style={[st.q, { color: t.muted }]}>What does this mean?</Text>
            <View style={[st.card, { backgroundColor: t.surface, borderColor: t.line }]}>
              <Muggulu color={t.dot} size={200} />
              <Text style={[st.glyph, { color: t.leaf }, step.w.te.length > 10 && st.glyphLong]} adjustsFontSizeToFit numberOfLines={2}>{step.w.te}</Text>
              <Btn variant="ghost" label="🔊 Hear it" onPress={() => say(step.w)} style={{ marginTop: 8, alignSelf: 'center' }} />
            </View>
            <View style={{ gap: 10, marginTop: 16, alignSelf: 'stretch' }}>
              {step.opts.map((o) => {
                const isRight = picked && o.id === step.w.id, isWrong = picked === o.id && o.id !== step.w.id;
                return (
                  <Pressable key={o.id} onPress={() => choose(o)} accessibilityRole="button" accessibilityLabel={o.en}
                    style={[st.opt, { backgroundColor: isRight ? t.leafSoft : isWrong ? t.kumkumSoft : t.surface,
                      borderColor: isRight ? t.leaf : isWrong ? t.kumkum : t.line }]}>
                    <Text style={{ fontSize: 28 }}>{o.e}</Text>
                    <Text style={[st.optTxt, { color: t.ink }]}>{o.en}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {step.t === 'listen' && (
          <>
            <Text style={[st.q, { color: t.muted }]}>{isLetter(step.w) ? 'Listen, then tap the letter' : 'Listen, then tap the picture'}</Text>
            <Pressable onPress={() => say(step.w)} accessibilityLabel="Play the word again"
              style={[st.listen, { backgroundColor: t.leaf }]}><Text style={{ fontSize: 48 }}>🔊</Text></Pressable>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
              {step.opts.map((o) => {
                const isRight = picked && o.id === step.w.id, isWrong = picked === o.id && o.id !== step.w.id;
                return (
                  <Pressable key={o.id} onPress={() => choose(o)} accessibilityRole="button" accessibilityLabel={o.en}
                    style={[st.tile, { backgroundColor: isRight ? t.leafSoft : isWrong ? t.kumkumSoft : t.surface,
                      borderColor: isRight ? t.leaf : isWrong ? t.kumkum : t.line }]}>
                    {isLetter(o)
                      ? <Text style={[st.tileGlyph, { color: t.leaf }]}>{o.te}</Text>
                      : <Text style={{ fontSize: 46 }}>{o.e}</Text>}
                    {picked && !isLetter(o) && <Text style={[st.tileTxt, { color: t.ink }]}>{o.te}</Text>}
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {step.t === 'win' && result && (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 90 }}>🌞</Text>
            <Text style={[st.winTitle, { color: t.ink }]}>చాలా బాగుంది!</Text>
            <Text style={[st.en, { color: t.muted, textAlign: 'center' }]}>
              Very good! {correct.current} of {quizTotal} answers right.
            </Text>
            <Text style={[st.tl, { color: t.ink, marginTop: 10 }]}>+{result.stars} stars, 🔥 {result.streak} day streak</Text>
          </View>
        )}
      </View>

      {step.t === 'learn' && <Btn label="Got it" onPress={next} />}
      {(step.t === 'meaning' || step.t === 'listen') && <Btn label="Next" disabled={!picked} onPress={next} />}
      {step.t === 'win' && (
        <View style={{ gap: 12 }}>
          <Btn label={`Send ${s.profile?.gma} a voice note 💛`} onPress={onShowFamily} />
          <Btn variant="ghost" label="Done" onPress={onClose} />
        </View>
      )}
    </View>
  );
}
const st = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 18 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bar: { flex: 1, height: 14, borderRadius: 9, overflow: 'hidden' },
  stage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { alignSelf: 'stretch', borderWidth: 2, borderRadius: 30, paddingVertical: 26, paddingHorizontal: 18, overflow: 'hidden' },
  glyph: { fontFamily: F.teHeavy, fontSize: 64, lineHeight: 92, textAlign: 'center' },
  glyphLong: { fontSize: 40, lineHeight: 60 },
  tl: { fontFamily: F.bold, fontSize: 20, textAlign: 'center' },
  en: { fontFamily: F.body, fontSize: 17, textAlign: 'center' },
  q: { fontFamily: F.bold, fontSize: 16, marginBottom: 10 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 2, borderBottomWidth: 5, borderRadius: 18, padding: 12 },
  optTxt: { fontFamily: F.bold, fontSize: 18 },
  listen: { width: 130, height: 130, borderRadius: 65, alignItems: 'center', justifyContent: 'center' },
  tile: { flex: 1, aspectRatio: 0.85, borderWidth: 2, borderBottomWidth: 5, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  tileTxt: { fontFamily: F.te, fontSize: 15, marginTop: 4, textAlign: 'center' },
  tileGlyph: { fontFamily: F.teHeavy, fontSize: 52, lineHeight: 74 },
  winTitle: { fontFamily: F.teHeavy, fontSize: 38, lineHeight: 56, marginTop: 6 },
});
