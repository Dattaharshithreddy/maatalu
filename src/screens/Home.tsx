import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { F, useTheme } from '../theme';
import { Btn, Chip, H2, Muggulu } from '../ui';
import { LESSON_SIZE, UNITS, firstAkshara } from '../content';
import { useStore } from '../store';

type Props = { openUnit: (i: number) => void; openReview: () => void; openPaywall: () => void };

export default function Home({ openUnit, openReview, openPaywall }: Props) {
  const t = useTheme();
  const ins = useSafeAreaInsets();
  const { s, toast } = useStore();
  const p = s.profile!;
  const count = (i: number) => UNITS[i].words.filter((w) => s.learned.includes(w.id)).length;
  const size = (i: number) => UNITS[i].words.length;
  const done = (i: number) => count(i) === size(i);
  const open = (i: number) => i === 0 || done(i - 1);
  const nextIdx = UNITS.findIndex((_, i) => !done(i));
  const cur = nextIdx < 0 ? -1 : nextIdx;
  const needsPremium = (i: number) => !UNITS[i].free && !s.premium;

  const tapUnit = (i: number) => {
    if (needsPremium(i)) return openPaywall();
    if (!open(i)) return toast('Finish the unit above first');
    openUnit(i);
  };

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: ins.top + 12, paddingBottom: 120 }}>
      <View style={st.head}>
        <View style={{ flex: 1 }}>
          <Text style={[st.hello, { color: t.ink }]} numberOfLines={2}>నమస్కారం, {p.child}!</Text>
          <Text style={{ fontFamily: F.body, color: t.muted }}>Ready for today's Telugu?</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Chip text={`🔥 ${s.streak}`} />
          <Chip text={`⭐ ${s.stars}`} />
        </View>
      </View>

      <View style={[st.today, { backgroundColor: t.leaf }]}>
        <View style={{ position: 'absolute', right: -40, top: -40 }}><Muggulu color="rgba(255,255,255,0.22)" size={200} /></View>
        {cur >= 0 ? (
          <>
            <Text style={[st.todayTitle, { color: t.onLeaf }]}>{UNITS[cur].name}</Text>
            <Text style={[st.glyph, { color: t.turmeric }]}>{firstAkshara(UNITS[cur].words[0].te)}</Text>
            <Text style={[st.todaySub, { color: t.onLeaf }]}>{Math.min(LESSON_SIZE, size(cur) - count(cur))} new words, about 5 minutes. {count(cur)} of {size(cur)} done in this unit.</Text>
            <Btn label={needsPremium(cur) ? 'Unlock this unit' : count(cur) > 0 ? 'Continue lesson' : 'Start lesson'}
              onPress={() => tapUnit(cur)} style={{ alignSelf: 'flex-start' }} />
          </>
        ) : (
          <>
            <Text style={[st.todayTitle, { color: t.onLeaf }]}>You finished every unit</Text>
            <Text style={[st.glyph, { color: t.turmeric }]}>⭐</Text>
            <Text style={[st.todaySub, { color: t.onLeaf }]}>Keep the streak going with a quick review.</Text>
            <Btn label="Review words" onPress={openReview} style={{ alignSelf: 'flex-start' }} />
          </>
        )}
      </View>

      {s.learned.length >= 5 && cur >= 0 && (
        <Pressable onPress={openReview} style={[st.row, { backgroundColor: t.turmericSoft }]} accessibilityRole="button">
          <Text style={{ fontSize: 30 }}>🔁</Text>
          <View style={{ flex: 1 }}>
            <Text style={[st.rowTitle, { color: t.ink }]}>Quick review</Text>
            <Text style={{ fontFamily: F.body, color: t.muted }}>Practise 5 words {p.child} already knows</Text>
          </View>
        </Pressable>
      )}

      <H2>Your path</H2>
      <View style={{ gap: 12 }}>
        {UNITS.map((u, i) => {
          const c = count(i), n = size(i), locked = needsPremium(i) || !open(i), fin = c === n;
          return (
            <Pressable key={u.id} onPress={() => tapUnit(i)} accessibilityRole="button" accessibilityLabel={`${u.name}, ${c} of ${n} words`}
              style={[st.unit, { backgroundColor: t.surface, borderColor: t.line, opacity: locked ? 0.6 : 1 }]}>
              <View style={[st.unitIc, { backgroundColor: fin ? t.turmericSoft : t.leafSoft }]}>
                <Text style={{ fontSize: 26 }}>{needsPremium(i) ? '👑' : !open(i) ? '🔒' : fin ? '⭐' : u.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[st.rowTitle, { color: t.ink }]}>{u.name}</Text>
                <Text style={{ fontFamily: F.body, color: t.muted, fontSize: 14 }}>
                  {needsPremium(i) ? 'Included with Maatalu Plus' : !open(i) ? 'Finish the unit above to open' : `${c} of ${n} words`}
                </Text>
                <View style={[st.bar, { backgroundColor: t.line }]}><View style={{ width: `${(c / n) * 100}%`, height: '100%', backgroundColor: t.leaf, borderRadius: 9 }} /></View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  hello: { fontFamily: F.teHeavy, fontSize: 28, lineHeight: 40 },
  today: { borderRadius: 28, padding: 22, overflow: 'hidden' },
  todayTitle: { fontFamily: F.bold, fontSize: 20 },
  glyph: { fontFamily: F.teHeavy, fontSize: 68, lineHeight: 92 },
  todaySub: { fontFamily: F.body, opacity: 0.9, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 22, padding: 14, marginTop: 14 },
  rowTitle: { fontFamily: F.bold, fontSize: 17 },
  av: { width: 50, height: 50, borderRadius: 25, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  play: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  playTxt: { color: '#fff', fontSize: 18 },
  unit: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2, borderRadius: 20, padding: 12 },
  unitIc: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  bar: { height: 8, borderRadius: 9, marginTop: 6, overflow: 'hidden' },
});
