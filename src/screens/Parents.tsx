import React, { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { F, useTheme } from '../theme';
import { Btn, Card, H2, whoEmoji, whoName } from '../ui';
import { ALL_WORDS, Speaker, UNITS, Word, speakerFor } from '../content';
import { dayKey, useStore } from '../store';
import { hasRealVoice, importVoiceFile, newId, playSequence, playUri, playWord, stopAll, useVoiceRecorder } from '../audio';

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
  const recorded = ALL_WORDS.filter((w) => hasRealVoice(w, speakerFor(w, s.teacher), s.wordVoices)).length;

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
          <Text style={{ fontFamily: F.bold, color: t.ink, fontSize: 17 }}>{p.gma} and {p.gpa}'s voices</Text>
          <Text style={{ fontFamily: F.body, color: t.muted }}>{recorded} of {ALL_WORDS.length} words in real voices. The rest use a robot voice: female for {p.gma}, male for {p.gpa}.</Text>
        </View>
      </Pressable>

      <H2>Words {p.child} knows</H2>
      {known.length === 0 ? (
        <Card style={{ borderStyle: 'dashed' }}><Text style={{ fontFamily: F.body, color: t.muted, textAlign: 'center' }}>No words yet. The first lesson teaches five.</Text></Card>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {known.slice(-120).map((w) => (
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

type PickedFile = { uri: string; name: string };
const natural = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

function VoicePack({ back }: { back: () => void }) {
  const t = useTheme();
  const { s, setWordVoice, deleteWordVoice, toast } = useStore();
  const rec = useVoiceRecorder();
  const p = s.profile!;
  const [who, setWho] = useState<Speaker>('gma');
  const [active, setActive] = useState<string | null>(null);
  const [playingUnit, setPlayingUnit] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);   // only one unit's rows are drawn at a time, so long lists stay fast
  const stopSeq = React.useRef<null | (() => void)>(null);
  const [review, setReview] = useState<null | { unitId: string; targets: Word[]; files: PickedFile[] }>(null);

  React.useEffect(() => () => { stopSeq.current?.(); stopAll(); }, []);

  const mine = (w: Word) => speakerFor(w, s.teacher) === who;
  const units = UNITS.map((u) => ({ u, words: u.words.filter(mine) })).filter((x) => x.words.length > 0);
  const total = units.reduce((n, x) => n + x.words.length, 0);
  const done = units.reduce((n, x) => n + x.words.filter((w) => hasRealVoice(w, who, s.wordVoices)).length, 0);
  const name = whoName(who, p);

  const onIn = (w: Word) => { stopSeq.current?.(); setPlayingUnit(null); setActive(w.id); rec.start(); };
  const onOut = async (w: Word) => {
    const r = await rec.stop(`word-${w.id}-${who}-${Date.now()}`);
    setActive(null);
    if (r === 'denied') return toast('Microphone access is off. Turn it on in phone Settings.');
    if (r === 'too-short') return toast('Hold the mic button while saying the word');
    if (!r) return;
    setWordVoice(w.id, who, r.uri);
    toast(`Saved ${name}'s "${w.tl}"`);
  };

  const playUnit = (unitId: string, words: Word[]) => {
    stopSeq.current?.();
    if (playingUnit === unitId) { setPlayingUnit(null); return; }
    setPlayingUnit(unitId);
    stopSeq.current = playSequence(words.map((w) => ({ w, who })), s.wordVoices, undefined, () => setPlayingUnit(null));
  };

  // Words still waiting for a real voice (or all of them if every word already has one).
  const targetsOf = (words: Word[]) => {
    const missing = words.filter((w) => !hasRealVoice(w, who, s.wordVoices));
    return missing.length ? missing : words;
  };
  const askOnWhatsApp = async (unitName: string, words: Word[]) => {
    const lines = targetsOf(words).map((w, i) => `${i + 1}. ${w.te} (${w.tl}) - ${w.en}`).join('\n');
    const message =
      `${name}, నమస్కారం! 🙏\nదయచేసి ఈ మాటలను ఒక్కొక్కటి ఒక్కో వాయిస్ నోట్‌లో, ఈ వరుసలోనే చెప్పి పంపండి 💛\n\n` +
      `Please record each word below as its own voice note, slowly and clearly, in this order (${unitName}):\n\n${lines}`;
    try { await Share.share({ message }); } catch { toast('Could not open sharing'); }
  };

  const pickFiles = async (unitId: string, words: Word[]) => {
    stopSeq.current?.(); setPlayingUnit(null);
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'audio/*', multiple: true, copyToCacheDirectory: true });
      if (res.canceled || !res.assets?.length) return;
      const targets = targetsOf(words);
      const files = res.assets.map((a) => ({ uri: a.uri, name: a.name })).sort((x, y) => natural(x.name, y.name));
      setReview({ unitId, targets, files });
    } catch { toast('Could not open the file picker'); }
  };
  const swap = (i: number) => setReview((r) => {
    if (!r || i < 1) return r;
    const files = [...r.files]; [files[i - 1], files[i]] = [files[i], files[i - 1]];
    return { ...r, files };
  });
  const drop = (i: number) => setReview((r) => (r ? { ...r, files: r.files.filter((_, k) => k !== i) } : r));
  const confirmImport = () => {
    if (!review) return;
    let ok = 0;
    review.targets.forEach((w, i) => {
      const f = review.files[i];
      if (!f) return;
      const uri = importVoiceFile(f.uri, `import-${w.id}-${who}-${newId()}`);
      if (uri) { setWordVoice(w.id, who, uri); ok += 1; }
    });
    stopAll();
    setReview(null);
    toast(ok ? `Added ${ok} of ${name}'s real voices` : 'Could not read those files');
  };

  return (
    <View>
      <Pressable onPress={back} hitSlop={10}><Text style={{ fontFamily: F.bold, color: t.leaf, fontSize: 16 }}>‹ Back</Text></Pressable>
      <Text style={[st.title, { color: t.ink }]}>Real voices</Text>
      <Card style={{ marginTop: 10, backgroundColor: t.turmericSoft, borderColor: 'transparent' }}>
        <Text style={{ fontFamily: F.bold, color: t.ink, fontSize: 16 }}>How to add {p.gma}'s real voice</Text>
        <Text style={{ fontFamily: F.body, color: t.ink, marginTop: 4, lineHeight: 21 }}>
          1. Under a unit below, tap 📲 Ask on WhatsApp. It sends the word list to {p.gma}.{'\n'}
          2. {p.gma} sends back one voice note per word, in order.{'\n'}
          3. Tap ⬆ Import notes and pick those voice notes (WhatsApp keeps them in a folder called "WhatsApp Voice Notes").{'\n'}
          Or hold the red mic next to a word to record it yourself. Until then, a robot voice is used: female for {p.gma}, male for {p.gpa}.
        </Text>
      </Card>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
        {(['gma', 'gpa'] as Speaker[]).map((x) => (
          <Pressable key={x} onPress={() => { stopSeq.current?.(); setPlayingUnit(null); setWho(x); }} accessibilityRole="radio" accessibilityState={{ selected: who === x }}
            style={[st.tab, { borderColor: who === x ? t.kumkum : t.line, backgroundColor: who === x ? t.kumkumSoft : t.surface }]}>
            <Text style={{ fontSize: 26 }}>{whoEmoji(x)}</Text>
            <Text style={{ fontFamily: F.bold, color: t.ink }}>{whoName(x, p)}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={{ fontFamily: F.bold, color: t.ink, marginTop: 12 }}>{done} of {total} words in {name}'s real voice</Text>

      {total === 0 ? (
        <Card style={{ marginTop: 12 }}><Text style={{ fontFamily: F.body, color: t.muted }}>{name} is not teaching right now. Change this in Settings under "Who teaches the words".</Text></Card>
      ) : units.map(({ u, words }) => (
        <View key={u.id}>
          <View style={{ marginTop: 20, marginBottom: 8 }}>
            <Pressable onPress={() => setOpenId(openId === u.id ? null : u.id)} accessibilityRole="button" accessibilityLabel={`${openId === u.id ? 'Hide' : 'Show'} ${u.name}`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontFamily: F.te, fontSize: 20, color: t.ink, flex: 1 }}>{u.name}</Text>
              <Text style={{ fontFamily: F.body, color: t.muted, fontSize: 13 }}>{words.filter((w) => hasRealVoice(w, who, s.wordVoices)).length}/{words.length} {openId === u.id ? '▲' : '▼'}</Text>
            </Pressable>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
              <Pressable onPress={() => askOnWhatsApp(u.name, words)} accessibilityLabel={`Ask ${name} on WhatsApp for ${u.name}`}
                style={[st.pill, { backgroundColor: t.kumkumSoft }]}><Text style={[st.pillTxt, { color: t.ink }]}>📲 Ask on WhatsApp</Text></Pressable>
              <Pressable onPress={() => pickFiles(u.id, words)} accessibilityLabel={`Import voice notes for ${u.name}`}
                style={[st.pill, { backgroundColor: t.turmericSoft }]}><Text style={[st.pillTxt, { color: t.ink }]}>⬆ Import notes</Text></Pressable>
              <Pressable onPress={() => playUnit(u.id, words)} accessibilityLabel={`Play ${u.name} one by one`}
                style={[st.pill, { backgroundColor: t.leafSoft }]}><Text style={[st.pillTxt, { color: t.ink }]}>{playingUnit === u.id ? '■ Stop' : '▶ Play all'}</Text></Pressable>
            </View>
          </View>
          {openId === u.id && <View style={{ gap: 8 }}>
            {words.map((w) => {
              const has = hasRealVoice(w, who, s.wordVoices), isRec = active === w.id && rec.recording;
              return (
                <View key={w.id} style={[st.vrow, { backgroundColor: t.surface, borderColor: isRec ? t.kumkum : t.line }]}>
                  <Text style={{ fontSize: 24 }}>{w.e}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: F.te, color: t.ink, fontSize: 19 }}>{w.te}</Text>
                    <Text style={{ fontFamily: F.body, color: t.muted, fontSize: 13, marginTop: -4 }}>{w.tl}, {w.en}</Text>
                    <Text style={{ fontFamily: F.bold, fontSize: 12, color: has ? t.leaf : t.muted }}>{has ? '✓ Real voice' : 'Robot voice'}</Text>
                  </View>
                  <Pressable onPress={() => playWord(w, who, s.wordVoices)} accessibilityLabel={`Play ${w.en}`} style={[st.mini, { backgroundColor: t.leafSoft }]}>
                    <Text style={{ fontSize: 16 }}>🔊</Text>
                  </Pressable>
                  {has && (
                    <Pressable onPress={() => Alert.alert('Go back to the robot voice for this word?', undefined, [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => deleteWordVoice(w.id, who) }])}
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
          </View>}
        </View>
      ))}

      <Modal visible={!!review} animationType="slide" onRequestClose={() => { stopAll(); setReview(null); }}>
        <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: 48 }}>
          <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
            <Text style={[st.title, { color: t.ink }]}>Match voice notes</Text>
            <Text style={{ fontFamily: F.body, color: t.muted }}>
              Files are matched to words in order, sorted by file name. Preview each one. Use ↑ to swap or ✕ to leave a file out, then import.
            </Text>
            {review && review.targets.map((w, i) => {
              const f = review.files[i];
              return (
                <View key={w.id} style={[st.vrow, { backgroundColor: t.surface, borderColor: t.line, marginTop: 8 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: F.te, color: t.ink, fontSize: 19 }}>{w.te} <Text style={{ fontFamily: F.body, fontSize: 13, color: t.muted }}>{w.en}</Text></Text>
                    <Text style={{ fontFamily: F.body, color: f ? t.ink : t.muted, fontSize: 13 }} numberOfLines={1}>{f ? f.name : 'No file, stays a robot voice'}</Text>
                  </View>
                  {f && (
                    <>
                      <Pressable onPress={() => playUri(f.uri)} accessibilityLabel="Preview" style={[st.mini, { backgroundColor: t.leafSoft }]}><Text>▶</Text></Pressable>
                      {i > 0 && <Pressable onPress={() => swap(i)} accessibilityLabel="Swap with the file above" style={[st.mini, { backgroundColor: t.turmericSoft }]}><Text>↑</Text></Pressable>}
                      <Pressable onPress={() => drop(i)} accessibilityLabel="Leave this file out" style={[st.mini, { backgroundColor: t.kumkumSoft }]}><Text>✕</Text></Pressable>
                    </>
                  )}
                </View>
              );
            })}
            {review && review.files.length > review.targets.length && (
              <Text style={{ fontFamily: F.body, color: t.muted, marginTop: 10 }}>{review.files.length - review.targets.length} extra file(s) will not be used.</Text>
            )}
            <Btn style={{ marginTop: 18 }} label={`Import ${review ? Math.min(review.files.length, review.targets.length) : 0} voice notes`}
              disabled={!review || review.files.length === 0} onPress={confirmImport} />
            <Btn style={{ marginTop: 10 }} variant="ghost" label="Cancel" onPress={() => { stopAll(); setReview(null); }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function Settings({ back, openPaywall }: { back: () => void; openPaywall: () => void }) {
  const t = useTheme();
  const { s, setProfile, setPremium, setTeacher, resetAll, toast } = useStore();
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

      <H2>Who teaches the words?</H2>
      <View style={{ gap: 8 }}>
        {([['both', `Both take turns`], ['gma', `Only ${p.gma}`], ['gpa', `Only ${p.gpa}`]] as const).map(([id, label]) => (
          <Pressable key={id} onPress={() => setTeacher(id)} accessibilityRole="radio" accessibilityState={{ selected: s.teacher === id }}
            style={[st.vrow, { backgroundColor: s.teacher === id ? t.leafSoft : t.surface, borderColor: s.teacher === id ? t.leaf : t.line }]}>
            <Text style={{ fontSize: 22 }}>{id === 'both' ? '👵👴' : whoEmoji(id)}</Text>
            <Text style={{ fontFamily: F.bold, color: t.ink, fontSize: 16, flex: 1 }}>{label}</Text>
            {s.teacher === id && <Text style={{ color: t.leaf, fontFamily: F.bold }}>✓</Text>}
          </Pressable>
        ))}
      </View>

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
  tab: { flex: 1, alignItems: 'center', borderWidth: 2, borderRadius: 16, paddingVertical: 10 },
  pill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  pillTxt: { fontFamily: F.bold, fontSize: 13 },
  mini: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
