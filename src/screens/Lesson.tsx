import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { F, useTheme } from '../theme';
import { Btn, Muggulu, SpeakWave, whoEmoji, whoName } from '../ui';
import { ALL_WORDS, LESSON_SIZE, UNITS, Word, isLetter, isSentence, kindOf, shuffle, speakerFor } from '../content';
import { useStore } from '../store';
import { hasRealVoice, hasTeluguVoice, playWord, stopAll, useVoiceRecorder } from '../audio';

/** Big Telugu text shrinks in steps for longer words and sentences, and wraps instead of being cut off. */
const glyphSize = (te: string) => {
  const n = te.length;
  if (n <= 6) return { fontSize: 64, lineHeight: 92 };
  if (n <= 11) return { fontSize: 48, lineHeight: 70 };
  if (n <= 18) return { fontSize: 38, lineHeight: 56 };
  return { fontSize: 30, lineHeight: 46 };
};

export type LessonMode = { kind: 'unit'; index: number } | { kind: 'review' };
type Step = { t: 'learn'; w: Word } | { t: 'meaning'; w: Word; opts: Word[] } | { t: 'listen'; w: Word; opts: Word[] } | { t: 'win' };

function buildSteps(mode: LessonMode, learned: string[]): Step[] {
  // Options come from the same kind of item (letters, words or sentences) and never share a meaning or a picture with the answer.
  const opts = (w: Word, pool: Word[]) => {
    const ok = (x: Word) => x.id !== w.id && kindOf(x) === kindOf(w) && x.en !== w.en && (kindOf(w) !== 'words' || x.e !== w.e);
    const same = pool.filter(ok);
    const extra = shuffle(ALL_WORDS.filter((x) => ok(x) && !same.includes(x))).slice(0, 8);
    const picks: Word[] = [];
    for (const x of [...shuffle(same), ...extra]) {
      if (picks.length === 2) break;
      if (picks.every((y) => y.en !== x.en && (kindOf(w) !== 'words' || y.e !== x.e))) picks.push(x);
    }
    return shuffle([w, ...picks]);
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

export default function Lesson({ mode, onClose }: { mode: LessonMode; onClose: () => void }) {
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
  const [speaking, setSpeaking] = useState(false);
  const say = (w: Word) => {
    setSpeaking(true);
    playWord(w, speakerFor(w, s.teacher), s.wordVoices, () => setSpeaking(false));
  };
  const p = s.profile!;
  const rec = useVoiceRecorder();
  const talkIn = () => { stopAll(); rec.start(); };
  const talkOut = async () => {
    const r = await rec.stop(`share-${Date.now()}`, false);
    if (r === 'denied') return toast('Microphone access is off. Turn it on in phone Settings.');
    if (r === 'too-short') return toast('Keep holding the button while you talk');
    if (!r) return;
    try {
      if (!(await Sharing.isAvailableAsync())) return toast('Sharing is not available on this phone');
      await Sharing.shareAsync(r.uri, { mimeType: 'audio/mp4', dialogTitle: `Send to ${p.gma}`, UTI: 'public.mpeg-4-audio' });
    } catch { toast('Could not open sharing. Try again.'); }
  };

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
    if (k === 0 && !hasTeluguVoice()) toast('No Telugu voice found on this phone. Install Telugu in Google Text-to-speech, or record real voices in the Parents tab.');
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
  const who = step.t !== 'win' ? speakerFor(step.w, s.teacher) : 'gma';
  const real = step.t !== 'win' && hasRealVoice(step.w, who, s.wordVoices);

  const optRow = (o: Word) => {
    const step_ = step as { w: Word };
    const isRight = picked && o.id === step_.w.id, isWrong = picked === o.id && o.id !== step_.w.id;
    return (
      <Pressable key={o.id} onPress={() => choose(o)} accessibilityRole="button" accessibilityLabel={o.en}
        style={[st.opt, { backgroundColor: isRight ? t.leafSoft : isWrong ? t.kumkumSoft : t.surface,
          borderColor: isRight ? t.leaf : isWrong ? t.kumkum : t.line }]}>
        <Text style={st.optEmoji}>{o.e}</Text>
        <Text style={[st.optTxt, { color: t.ink }]}>{o.en}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[st.wrap, { backgroundColor: t.bg, paddingTop: ins.top + 10, paddingBottom: ins.bottom + 16 }]}>
      <View style={st.head}>
        <Pressable onPress={onClose} accessibilityLabel="Close lesson" hitSlop={12}><Text style={{ fontSize: 26, color: t.muted }}>✕</Text></Pressable>
        <View style={[st.bar, { backgroundColor: t.line }]}>
          <View style={{ width: `${(k / (steps.length - 1)) * 100}%`, height: '100%', backgroundColor: t.turmeric, borderRadius: 9 }} />
        </View>
      </View>

      <ScrollView style={st.stageWrap} contentContainerStyle={st.stage} showsVerticalScrollIndicator={false}>
        {step.t === 'learn' && (
          <>
            <View style={[st.who, { backgroundColor: who === 'gma' ? t.kumkumSoft : t.leafSoft }]}>
              <View style={[st.whoAv, { backgroundColor: t.surface, borderColor: who === 'gma' ? t.kumkum : t.leaf }]}>
                <Text style={{ fontSize: 24 }}>{whoEmoji(who)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: F.bold, color: t.ink, fontSize: 16 }}>{whoName(who, p)} says</Text>
                <Text style={{ fontFamily: F.body, color: t.muted, fontSize: 12 }}>{real ? `${whoName(who, p)}'s own voice` : 'Robot voice for now'}</Text>
              </View>
              <SpeakWave active={speaking} color={who === 'gma' ? t.kumkum : t.leaf} />
            </View>
            <View style={[st.card, { backgroundColor: t.surface, borderColor: t.line, marginTop: 12 }]}>
              <Muggulu color={t.dot} size={260} />
              <Text style={{ fontSize: 60, textAlign: 'center' }}>{step.w.e}</Text>
              <Text style={[st.glyph, { color: t.leaf }, glyphSize(step.w.te)]}>{step.w.te}</Text>
              <Text style={[st.tl, { color: t.ink }]}>{step.w.tl}</Text>
              <Text style={[st.en, { color: t.muted }]}>{step.w.en}</Text>
              <Btn variant="ghost" label={`🔊 Hear ${whoName(who, p)} again`} onPress={() => say(step.w)} style={{ marginTop: 16, alignSelf: 'center' }} />
            </View>
            <Text style={{ fontFamily: F.bold, color: t.ink, fontSize: 17, textAlign: 'center', marginTop: 14 }}>Now you say it out loud 🗣️</Text>
          </>
        )}

        {step.t === 'meaning' && (
          <>
            <Text style={[st.q, { color: t.muted }]}>What does this mean?</Text>
            <View style={[st.card, { backgroundColor: t.surface, borderColor: t.line }]}>
              <Muggulu color={t.dot} size={200} />
              <Text style={[st.glyph, { color: t.leaf }, glyphSize(step.w.te)]}>{step.w.te}</Text>
              <Btn variant="ghost" label="🔊 Hear it" onPress={() => say(step.w)} style={{ marginTop: 8, alignSelf: 'center' }} />
            </View>
            <View style={{ gap: 10, marginTop: 16, alignSelf: 'stretch' }}>{step.opts.map(optRow)}</View>
          </>
        )}

        {step.t === 'listen' && (
          <>
            <Text style={[st.q, { color: t.muted }]}>{isLetter(step.w) ? 'Listen, then tap the letter' : isSentence(step.w) ? 'Listen, then tap what it means' : 'Listen, then tap what you heard'}</Text>
            <Pressable onPress={() => say(step.w)} accessibilityLabel="Play the word again"
              style={[st.listen, { backgroundColor: t.leaf }]}><Text style={{ fontSize: 48 }}>🔊</Text></Pressable>
            {isSentence(step.w) ? (
              <View style={{ gap: 10, marginTop: 20, alignSelf: 'stretch' }}>{step.opts.map(optRow)}</View>
            ) : (
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 24, alignSelf: 'stretch' }}>
                {step.opts.map((o) => {
                  const isRight = picked && o.id === step.w.id, isWrong = picked === o.id && o.id !== step.w.id;
                  return (
                    <Pressable key={o.id} onPress={() => choose(o)} accessibilityRole="button" accessibilityLabel={o.en}
                      style={[st.tile, { backgroundColor: isRight ? t.leafSoft : isWrong ? t.kumkumSoft : t.surface,
                        borderColor: isRight ? t.leaf : isWrong ? t.kumkum : t.line }]}>
                      {isLetter(o)
                        ? <Text style={[st.tileGlyph, { color: t.leaf }]}>{o.te}</Text>
                        : <>
                            <Text style={{ fontSize: 40 }}>{o.e}</Text>
                            <Text style={[st.tileEn, { color: t.ink }]}>{o.en}</Text>
                          </>}
                      {picked && !isLetter(o) && <Text style={[st.tileTxt, { color: t.leaf }]}>{o.te}</Text>}
                    </Pressable>
                  );
                })}
              </View>
            )}
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
      </ScrollView>

      {step.t === 'learn' && <Btn label="Got it" onPress={next} />}
      {(step.t === 'meaning' || step.t === 'listen') && <Btn label="Next" disabled={!picked} onPress={next} />}
      {step.t === 'win' && (
        <View style={{ gap: 12 }}>
          <Text style={{ fontFamily: F.body, color: t.muted, textAlign: 'center' }}>
            Tell {p.gma} what you learned today. Hold the button, talk, then send it on WhatsApp.
          </Text>
          <Btn variant="danger" label={rec.recording ? '🔴 Recording… let go to send' : `🎙️ Hold to tell ${p.gma}`}
            onPressIn={talkIn} onPressOut={talkOut} a11y={`Hold to record a voice note for ${p.gma}`} />
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
  stageWrap: { flex: 1, alignSelf: 'stretch' },
  stage: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 8 },
  card: { alignSelf: 'stretch', borderWidth: 2, borderRadius: 30, paddingVertical: 26, paddingHorizontal: 18, overflow: 'hidden' },
  glyph: { fontFamily: F.teHeavy, fontSize: 64, lineHeight: 92, textAlign: 'center' },
  tl: { fontFamily: F.bold, fontSize: 20, textAlign: 'center', marginTop: 4 },
  en: { fontFamily: F.body, fontSize: 17, textAlign: 'center' },
  q: { fontFamily: F.bold, fontSize: 16, marginBottom: 10 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 2, borderBottomWidth: 5, borderRadius: 18, padding: 12 },
  optEmoji: { fontSize: 28, width: 40, textAlign: 'center' },
  optTxt: { fontFamily: F.bold, fontSize: 18, flex: 1, flexShrink: 1 },
  listen: { width: 130, height: 130, borderRadius: 65, alignItems: 'center', justifyContent: 'center' },
  tile: { flex: 1, minHeight: 150, borderWidth: 2, borderBottomWidth: 5, borderRadius: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, paddingVertical: 10 },
  tileEn: { fontFamily: F.bold, fontSize: 15, textAlign: 'center', marginTop: 6 },
  tileTxt: { fontFamily: F.te, fontSize: 15, marginTop: 4, textAlign: 'center' },
  who: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, padding: 10 },
  whoAv: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  tileGlyph: { fontFamily: F.teHeavy, fontSize: 52, lineHeight: 74 },
  winTitle: { fontFamily: F.teHeavy, fontSize: 38, lineHeight: 56, marginTop: 6 },
});
