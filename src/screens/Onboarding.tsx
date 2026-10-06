import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { F, useTheme } from '../theme';
import { Btn, Muggulu } from '../ui';
import { Profile, useStore } from '../store';

const AGES: Profile['age'][] = ['4-6', '7-9', '10-12'];

export default function Onboarding() {
  const t = useTheme();
  const ins = useSafeAreaInsets();
  const { setProfile } = useStore();
  const [step, setStep] = useState(0);
  const [child, setChild] = useState('');
  const [age, setAge] = useState<Profile['age']>('4-6');
  const [gma, setGma] = useState('Ammamma');
  const [gpa, setGpa] = useState('Tatayya');

  const input = [st.input, { borderColor: t.line, backgroundColor: t.surface, color: t.ink }];
  const label = [st.label, { color: t.ink }];

  if (step === 0) {
    return (
      <View style={[st.wrap, { backgroundColor: t.leaf, paddingTop: ins.top + 40, paddingBottom: ins.bottom + 24 }]}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Muggulu color="rgba(255,255,255,0.25)" size={300} />
          <Text style={[st.logo, { color: t.turmeric }]}>మాటలు</Text>
          <Text style={st.brand}>Maatalu</Text>
          <Text style={st.pitch}>Ten minutes a day of Telugu, so your child can talk with grandma and grandpa in their own language.</Text>
        </View>
        <Btn label="Set up for my child" onPress={() => setStep(1)} />
      </View>
    );
  }
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: ins.top + 24, paddingBottom: ins.bottom + 24 }} keyboardShouldPersistTaps="handled">
        <Text style={[st.title, { color: t.ink }]}>About your child</Text>
        <Text style={label}>Child's name</Text>
        <TextInput value={child} onChangeText={setChild} placeholder="e.g. Aarav" placeholderTextColor={t.muted} style={input} autoFocus />
        <Text style={label}>Age</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {AGES.map((a) => (
            <Pressable key={a} onPress={() => setAge(a)} accessibilityRole="radio" accessibilityState={{ selected: age === a }}
              style={[st.age, { borderColor: age === a ? t.leaf : t.line, backgroundColor: age === a ? t.leafSoft : t.surface }]}>
              <Text style={{ fontFamily: F.bold, color: t.ink, fontSize: 16 }}>{a} yrs</Text>
            </Pressable>
          ))}
        </View>
        <Text style={[st.title, { color: t.ink, marginTop: 28 }]}>Family in India</Text>
        <Text style={{ fontFamily: F.body, color: t.muted, marginBottom: 6 }}>Use the names your child calls them. These appear in lessons and voice messages.</Text>
        <Text style={label}>Grandma</Text>
        <TextInput value={gma} onChangeText={setGma} style={input} />
        <Text style={label}>Grandpa</Text>
        <TextInput value={gpa} onChangeText={setGpa} style={input} />
        <Btn style={{ marginTop: 28 }} label="Start learning" disabled={!child.trim()}
          onPress={() => setProfile({ child: child.trim(), age, gma: gma.trim() || 'Ammamma', gpa: gpa.trim() || 'Tatayya' })} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const st = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 24 },
  logo: { fontFamily: F.teHeavy, fontSize: 84, textAlign: 'center', lineHeight: 110 },
  brand: { fontFamily: F.bold, fontSize: 22, color: '#fff', textAlign: 'center', marginTop: -6 },
  pitch: { fontFamily: F.body, fontSize: 18, color: '#fff', textAlign: 'center', marginTop: 18, lineHeight: 26, opacity: 0.92 },
  title: { fontFamily: F.te, fontSize: 28, marginBottom: 6 },
  label: { fontFamily: F.bold, fontSize: 15, marginTop: 14, marginBottom: 6 },
  input: { borderWidth: 2, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontFamily: F.body, fontSize: 17 },
  age: { flex: 1, borderWidth: 2, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
});
