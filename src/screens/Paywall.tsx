import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { F, useTheme } from '../theme';
import { Btn, Muggulu } from '../ui';
import { useStore } from '../store';
import { ALL_WORDS, UNITS } from '../content';

const PLANS = [
  { id: 'year', title: 'Yearly', price: '$59.99 / year', note: 'Save 50%, about $5 a month' },
  { id: 'month', title: 'Monthly', price: '$9.99 / month', note: 'Cancel anytime' },
];

export default function Paywall({ onClose }: { onClose: () => void }) {
  const t = useTheme();
  const ins = useSafeAreaInsets();
  const { s, setPremium, toast } = useStore();
  const [plan, setPlan] = useState('year');
  const perks = [
    ['📚', `All ${UNITS.length} units: ${ALL_WORDS.length}+ words, the Telugu alphabet and real sentences`],
    ['👵', `${s.profile?.gma} and ${s.profile?.gpa} teaching in their own real voices`],
    ['📲', `Send ${s.profile?.gma} a voice note on WhatsApp after each lesson`],
    ['📈', 'Weekly progress for parents'],
  ];
  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={{ padding: 22, paddingTop: ins.top + 14, paddingBottom: ins.bottom + 24 }}>
      <Pressable onPress={onClose} accessibilityLabel="Close" hitSlop={12} style={{ alignSelf: 'flex-end' }}>
        <Text style={{ fontSize: 26, color: t.muted }}>✕</Text>
      </Pressable>
      <View style={[st.hero, { backgroundColor: t.leaf }]}>
        <Muggulu color="rgba(255,255,255,0.22)" size={220} />
        <Text style={[st.logo, { color: t.turmeric }]}>మాటలు Plus</Text>
        <Text style={st.sub}>Give {s.profile?.child} the words to talk with family.</Text>
      </View>
      <View style={{ gap: 12, marginTop: 20 }}>
        {perks.map(([e, txt]) => (
          <View key={txt} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 24 }}>{e}</Text>
            <Text style={{ fontFamily: F.bold, color: t.ink, fontSize: 16, flex: 1 }}>{txt}</Text>
          </View>
        ))}
      </View>
      <View style={{ gap: 10, marginTop: 22 }}>
        {PLANS.map((pl) => (
          <Pressable key={pl.id} onPress={() => setPlan(pl.id)} accessibilityRole="radio" accessibilityState={{ selected: plan === pl.id }}
            style={[st.plan, { borderColor: plan === pl.id ? t.leaf : t.line, backgroundColor: plan === pl.id ? t.leafSoft : t.surface }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: F.bold, color: t.ink, fontSize: 18 }}>{pl.title}</Text>
              <Text style={{ fontFamily: F.body, color: t.muted }}>{pl.note}</Text>
            </View>
            <Text style={{ fontFamily: F.bold, color: t.ink, fontSize: 16 }}>{pl.price}</Text>
          </Pressable>
        ))}
      </View>
      <Btn style={{ marginTop: 22 }} label="Start 7-day free trial"
        onPress={() => { setPremium(true); toast('Plus unlocked. Enjoy every unit!'); onClose(); }} />
      <Text style={{ fontFamily: F.body, color: t.muted, fontSize: 13, textAlign: 'center', marginTop: 12 }}>
        Test build: no payment is taken. Google Play billing is connected before release.
      </Text>
    </ScrollView>
  );
}
const st = StyleSheet.create({
  hero: { borderRadius: 28, paddingVertical: 34, paddingHorizontal: 20, alignItems: 'center', overflow: 'hidden', marginTop: 8 },
  logo: { fontFamily: F.teHeavy, fontSize: 40 },
  sub: { fontFamily: F.bold, color: '#fff', fontSize: 17, textAlign: 'center' },
  plan: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 18, padding: 14 },
});
