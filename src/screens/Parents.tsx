import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { F, useTheme } from '../theme';
import { Btn, Card, H2 } from '../ui';
import { ALL_WORDS, UNITS, Word } from '../content';
import { dayKey, useStore } from '../store';
import { playUri, playWord, useVoiceRecorder } from '../audio';

export default function Parents({ openPaywall }: { openPaywall: () => void }) {
  const t = useTheme();
  const ins = useSafeAreaInsets();
  const { s } = useStore();
  const [unlocked, setUnlocked] = useState(false);
  const [view, setView] = useState<'main' | 'voices' | 'settings'>('main');
  const pad = { paddingHorizontal: 18, paddingTop: ins.top + 12, paddingBottom: 130 };

  if (!unlocked) return <Gate onPass={() => setUnlocked(true)} top={ins.top} />;
  if (view === 'voices') return <ScrollView contentContainerStyle={pad}><VoicePack back={() => setView('main')} /></ScrollView>;
  if (view === 'settings') return <ScrollView contentContainerStyle={pad} keyboardShouldPersistTaps="handled"><Settings back={() => setView('main')} openPaywall={openPaywall} /></ScrollView>;

  const p = s.profile!;
  const totalMin = Object.values(s.minutes).reduce((a, b) => a + b, 0);
  const days = Array.from({ length: 7 }).map((_, k) => { const d = new Date(); d.setDate(d.getDate() - 6 + k); return d; });
  const vals = days.map((d) => s.minutes[dayKey(d)] || 0);
  const max = Math.max(10, ...vals);
  const known = ALL_WORDS.filter((w) => s.learned.includes(w.id));
  const recorded = Object.keys(s.wordVoices).length;

  return (
    <ScrollView contentContainerStyle={pad}>
      <Text style={[st.title, { color: t.ink }]}>{p.child}'s progress</Text>
      <View style={st.stats}>
        {[[known.length, 'words'], [totalMin, 'minutes'], [s.streak, 'day streak']].map(([n, l]) => (
          <View key={String(l)} style={[st.stat, { backgroundColor: t.surface, borderColor: t.line }]}>
            <Text style={[st.statN, { color: t.leaf }]}>{n}</Text>
            <Text style={{ fontFamily: F.bold, color: t.muted, fontSize: 13 }}>{l}</Text>
          </View>
        ))}
      </View>

      <H2>Minutes each day</H2>
      <View style={[st.week, { backgroundColor: t.surface, borderColor: t.line }]}>
        {days.map((d, k) => (
          <View key={k} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 6 }}>
            <View style={{ width: '100%', borderRadius: 8, height: `${Math.max(6, (vals[k] / max) * 100)}%`, backgroundColor: k === 6 ? t.turmeric : t.leafSoft }} />
            <Text style={{ fontFamily: F.bold, color: t.muted, fontSize: 12 }}>{d.toLocaleDateString('en', { weekday: 'narrow' })}</Text>
          </View>
        ))}
      </View>

      <H2>Make it your family's voice</H2>
      <Pressable onPress={() => setView('voices')} style={[st.row, { backgroundColor: t.kumkumSoft }]} accessibilityRole="button">
        <Text style={{ fontSize: 30 }}>👵</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.bold, color: t.ink, fontSize: 17 }}>{p.gma}'s voice pack</Text>
          <Text style={{ fontFamily: F.body, color: t.muted }}>{recorded} of {ALL_WORDS.length} words recorded. Lessons play these instead of the robot voice.</Text>
        </View>
      </Pressable>

      <H2>Words {p.child} knows</H2>
      {known.length === 0 ? (
        <Card style={{ borderStyle: 'dashed' }}><Text style={{ fontFamily: F.body, color: t.muted, textAlign: 'center' }}>No words yet. The first lesson teaches five.</Text></Card>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {known.map((w) => (
            <View key={w.id} style={[st.word, { backgroundColor: t.surface, borderColor: t.line }]}>
              <Text style={{ fontFamily: F.te, color: t.ink, fontSize: 18 }}>{w.te}</Text>
              <Text style={{ fontFamily: F.body, color: t.muted, fontSize: 12, marginTop: -4 }}>{w.en}</Text>
            </View>
          ))}
        </View>
      )}

      <H2>Account</H2>
      <View style={{ gap: 10 }}>
        <Btn variant="ghost" label="Settings and names" onPress={() => setView('settings')} />
        {!s.premium && <Btn label="Unlock all units with Plus" onPress={openPaywall} />}
      </View>
    </ScrollView>
  );
}

function Gate({ onPass, top }: { onPass: () => void; top: number }) {
  const t = useTheme();
  const q = useMemo(() => { const a = 6 + Math.floor(Math.random() * 4), b = 3 + Math.floor(Math.random() * 6); return { a, b }; }, []);
  const [v, setV] = useState('');
  const [err, setErr] = useState(false);
  const check = () => (Number(v) === q.a * q.b ? onPass() : (setErr(true), setV('')));
  return (
    <View style={{ flex: 1, padding: 24, paddingTop: top + 60, alignItems: 'center' }}>
      <Text style={{ fontSize: 54 }}>🔐</Text>
      <Text style={[st.title, { color: t.ink, textAlign: 'center' }]}>For grown-ups</Text>
      <Text style={{ fontFamily: F.body, color: t.muted, textAlign: 'center', marginBottom: 18 }}>Answer to see progress, record the voice pack and change settings.</Text>
      <Text style={{ fontFamily: F.bold, color: t.ink, fontSize: 26 }}>{q.a} × {q.b} = ?</Text>
      <TextInput value={v} onChangeText={(x) => { setV(x); setErr(false); }} keyboardType="number-pad" onSubmitEditing={check}
        accessibilityLabel="Answer" style={[st.input, { borderColor: err ? t.kumkum : t.line, color: t.ink, backgroundColor: t.surface, width: 140, textAlign: 'center' }]} />
      {err && <Text style={{ fontFamily: F.bold, color: t.kumkum, marginTop: 6 }}>That is not right. Try again.</Text>}
      <Btn label="Continue" onPress={check} disabled={!v} style={{ marginTop: 16, alignSelf: 'stretch' }} />
    </View>
  );
}

function VoicePack({ back }: { back: () => void }) {
  const t = useTheme();
  const { s, setWordVoice, deleteWordVoice, toast } = useStore();
  const rec = useVoiceRecorder();
  const [active, setActive] = useState<string | null>(null);
  const p = s.profile!;

  const onIn = (w: Word) => { setActive(w.id); rec.start(); };
  const onOut = async (w: Word) => {
    const r = await rec.stop(`word-${w.id}-${Date.now()}`);
    setActive(null);
    if (r === 'denied') return toast('Microphone access is off. Turn it on in phone Settings.');
    if (r === 'too-short') return toast('Hold the mic button while saying the word');
    if (!r) return;
    setWordVoice(w.id, r.uri);
    toast(`Saved ${p.gma}'s "${w.tl}"`);
  };

  return (
    <View>
      <Pressable onPress={back} hitSlop={10}><Text style={{ fontFamily: F.bold, color: t.leaf, fontSize: 16 }}>‹ Back</Text></Pressable>
      <Text style={[st.title, { color: t.ink }]}>{p.gma}'s voice pack</Text>
      <Text style={{ fontFamily: F.body, color: t.muted }}>
        Hand the phone to {p.gma} or {p.gpa}, or record over a video call. Hold the mic, say the word, let go. Lessons will play their voice.
      </Text>
      {UNITS.map((u) => (
        <View key={u.id}>
          <H2>{u.name}</H2>
          <View style={{ gap: 8 }}>
            {u.words.map((w) => {
              const has = !!s.wordVoices[w.id], isRec = active === w.id && rec.recording;
              return (
                <View key={w.id} style={[st.vrow, { backgroundColor: t.surface, borderColor: isRec ? t.kumkum : t.line }]}>
                  <Text style={{ fontSize: 24 }}>{w.e}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: F.te, color: t.ink, fontSize: 19 }}>{w.te}</Text>
                    <Text style={{ fontFamily: F.body, color: t.muted, fontSize: 13, marginTop: -4 }}>{w.tl}, {w.en}</Text>
                  </View>
                  <Pressable onPress={() => playWord(w, s.wordVoices)} accessibilityLabel={`Play ${w.en}`} style={[st.mini, { backgroundColor: t.leafSoft }]}>
                    <Text style={{ fontSize: 16 }}>{has ? '👵' : '🔊'}</Text>
                  </Pressable>
                  {has && (
                    <Pressable onPress={() => Alert.alert('Remove this recording?', undefined, [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => deleteWordVoice(w.id) }])}
                      accessibilityLabel={`Remove recording for ${w.en}`} style={[st.mini, { backgroundColor: t.kumkumSoft }]}>
                      <Text style={{ fontSize: 14 }}>✕</Text>
                    </Pressable>
                  )}
                  <Pressable onPressIn={() => onIn(w)} onPressOut={() => onOut(w)} accessibilityLabel={`Hold to record ${w.en}`}
                    style={[st.mini, { backgroundColor: t.kumkum, width: 48 }]}>
                    <Text style={{ fontSize: 16, color: '#fff' }}>{isRec ? '●' : '🎙️'}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

function Settings({ back, openPaywall }: { back: () => void; openPaywall: () => void }) {
  const t = useTheme();
  const { s, setProfile, setPremium, resetAll, toast } = useStore();
  const p = s.profile!;
  const [child, setChild] = useState(p.child);
  const [gma, setGma] = useState(p.gma);
  const [gpa, setGpa] = useState(p.gpa);
  const input = [st.input, { borderColor: t.line, color: t.ink, backgroundColor: t.surface }];
  return (
    <View>
      <Pressable onPress={back} hitSlop={10}><Text style={{ fontFamily: F.bold, color: t.leaf, fontSize: 16 }}>‹ Back</Text></Pressable>
      <Text style={[st.title, { color: t.ink }]}>Settings</Text>
      <Text style={st.label}>Child's name</Text>
      <TextInput value={child} onChangeText={setChild} style={input} />
      <Text style={st.label}>Grandma</Text>
      <TextInput value={gma} onChangeText={setGma} style={input} />
      <Text style={st.label}>Grandpa</Text>
      <TextInput value={gpa} onChangeText={setGpa} style={input} />
      <Btn style={{ marginTop: 16 }} label="Save names" disabled={!child.trim()}
        onPress={() => { setProfile({ ...p, child: child.trim(), gma: gma.trim() || p.gma, gpa: gpa.trim() || p.gpa }); toast('Names saved'); }} />

      <H2>Subscription</H2>
      <Card>
        <Text style={{ fontFamily: F.bold, color: t.ink, fontSize: 17 }}>{s.premium ? 'Maatalu Plus is active' : 'Free plan'}</Text>
        <Text style={{ fontFamily: F.body, color: t.muted, marginTop: 2 }}>
          {s.premium ? 'All units are unlocked.' : 'The first three units are free. Plus unlocks every unit.'}
        </Text>
        <Btn style={{ marginTop: 12 }} variant={s.premium ? 'ghost' : 'primary'} label={s.premium ? 'Turn off Plus (test mode)' : 'See Plus plans'}
          onPress={() => (s.premium ? setPremium(false) : openPaywall())} />
      </Card>

      <H2>Start over</H2>
      <Btn variant="danger" label="Erase all progress and recordings"
        onPress={() => Alert.alert('Erase everything?', 'Progress, stars and all family recordings will be deleted from this phone.', [
          { text: 'Cancel', style: 'cancel' }, { text: 'Erase', style: 'destructive', onPress: resetAll }])} />
    </View>
  );
}

const st = StyleSheet.create({
  title: { fontFamily: F.teHeavy, fontSize: 28, lineHeight: 40, marginTop: 6 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 10 },
  stat: { flex: 1, borderWidth: 2, borderRadius: 20, paddingVertical: 12, alignItems: 'center' },
  statN: { fontFamily: F.teHeavy, fontSize: 32, lineHeight: 44 },
  week: { flexDirection: 'row', gap: 10, height: 140, borderWidth: 2, borderRadius: 20, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 22, padding: 14 },
  word: { borderWidth: 2, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 4 },
  input: { borderWidth: 2, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontFamily: F.body, fontSize: 17, marginTop: 6 },
  label: { fontFamily: F.bold, fontSize: 15, marginTop: 14, color: '#7A8C84' },
  vrow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 2, borderRadius: 18, padding: 10 },
  mini: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
