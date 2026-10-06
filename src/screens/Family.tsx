import React, { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { F, useTheme } from '../theme';
import { Card, H2, ago, whoEmoji, whoName } from '../ui';
import { Message, useStore } from '../store';
import { newId, playUri, stopAll, useVoiceRecorder } from '../audio';

type Who = Message['who'];

export default function Family() {
  const t = useTheme();
  const ins = useSafeAreaInsets();
  const { s, addMessage, deleteMessage, addStars, toast } = useStore();
  const p = s.profile!;
  const [who, setWho] = useState<Who>('child');
  const [playing, setPlaying] = useState<string | null>(null);
  const [secs, setSecs] = useState(0);
  const rec = useVoiceRecorder();
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { stopAll(); if (tick.current) clearInterval(tick.current); }, []);

  const onIn = () => {
    setPlaying(null);
    setSecs(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    rec.start();
    tick.current = setInterval(() => setSecs((x) => x + 1), 1000);
  };
  const onOut = async () => {
    if (tick.current) { clearInterval(tick.current); tick.current = null; }
    const id = newId();
    const r = await rec.stop(id);
    if (r === 'denied') return toast('Microphone access is off. Turn it on in phone Settings to record.');
    if (r === 'too-short') return toast('Keep holding the button while you speak');
    if (!r) return;
    addMessage({ id, who, uri: r.uri, seconds: r.seconds, at: Date.now() });
    if (who === 'child') { addStars(2); toast(`Saved for ${p.gma} 💛 +2 stars`); } else toast('Message saved');
  };
  const play = (m: Message) => {
    setPlaying(m.id);
    playUri(m.uri, () => setPlaying((x) => (x === m.id ? null : x)));
  };
  const confirmDelete = (m: Message) =>
    Alert.alert('Delete this voice note?', 'This removes the recording from this phone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMessage(m.id) },
    ]);

  const people: Who[] = ['child', 'gma', 'gpa'];

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: ins.top + 12, paddingBottom: 130 }}>
      <Text style={[st.title, { color: t.ink }]}>Family voices</Text>
      <Text style={{ fontFamily: F.body, color: t.muted }}>
        Record a voice note from {p.child}, or let {p.gma} and {p.gpa} record one during a visit or video call.
      </Text>

      <H2>Who is speaking?</H2>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {people.map((w) => (
          <Pressable key={w} onPress={() => setWho(w)} accessibilityRole="radio" accessibilityState={{ selected: who === w }}
            style={[st.who, { borderColor: who === w ? t.kumkum : t.line, backgroundColor: who === w ? t.kumkumSoft : t.surface }]}>
            <Text style={{ fontSize: 26 }}>{whoEmoji(w)}</Text>
            <Text style={{ fontFamily: F.bold, color: t.ink, fontSize: 14 }} numberOfLines={1}>{whoName(w, p)}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPressIn={onIn} onPressOut={onOut} accessibilityRole="button" accessibilityLabel="Hold to record a voice note"
        style={[st.rec, { backgroundColor: t.kumkum, opacity: rec.recording ? 0.85 : 1 }]}>
        <Text style={st.recTxt}>{rec.recording ? `🔴 Recording ${secs}s, let go to save` : '🎙️ Hold to record'}</Text>
      </Pressable>

      <H2>Voice notes</H2>
      {s.messages.length === 0 ? (
        <Card style={{ borderStyle: 'dashed' }}>
          <Text style={{ fontFamily: F.body, color: t.muted, textAlign: 'center' }}>
            No voice notes yet. Hold the red button and say "{'నమస్కారం'}, {p.gma}!"
          </Text>
        </Card>
      ) : (
        <View style={{ gap: 10 }}>
          {s.messages.map((m) => (
            <Pressable key={m.id} onLongPress={() => confirmDelete(m)} delayLongPress={450}
              style={[st.msg, { backgroundColor: m.who === 'child' ? t.leafSoft : t.surface, borderColor: m.who === 'child' ? 'transparent' : t.line }]}>
              <View style={[st.av, { borderColor: m.who === 'child' ? t.leaf : t.kumkum, backgroundColor: t.surface }]}>
                <Text style={{ fontSize: 24 }}>{whoEmoji(m.who)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: F.bold, color: t.ink, fontSize: 16 }}>{whoName(m.who, p)}</Text>
                <Text style={{ fontFamily: F.body, color: t.muted, fontSize: 13 }}>{m.seconds}s, {ago(m.at)}</Text>
                <Wave active={playing === m.id} color={m.who === 'child' ? t.leaf : t.kumkum} />
              </View>
              <Pressable onPress={() => (playing === m.id ? (stopAll(), setPlaying(null)) : play(m))}
                accessibilityLabel={playing === m.id ? 'Stop' : 'Play'}
                style={[st.play, { backgroundColor: m.who === 'child' ? t.leaf : t.kumkum }]}>
                <Text style={{ color: '#fff', fontSize: 18 }}>{playing === m.id ? '■' : '▶'}</Text>
              </Pressable>
            </Pressable>
          ))}
          <Text style={{ fontFamily: F.body, color: t.muted, fontSize: 13, textAlign: 'center', marginTop: 4 }}>Press and hold a note to delete it.</Text>
        </View>
      )}
    </ScrollView>
  );
}

function Wave({ active, color }: { active: boolean; color: string }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setPhase((x) => x + 1), 120);
    return () => clearInterval(id);
  }, [active]);
  return (
    <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center', height: 20, marginTop: 4 }}>
      {Array.from({ length: 18 }).map((_, i) => (
        <View key={i} style={{ width: 4, borderRadius: 2, backgroundColor: color, opacity: active ? 1 : 0.45,
          height: active ? 6 + Math.abs(Math.sin((i + phase) * 0.7)) * 14 : 6 + ((i * 7) % 5) * 2 }} />
      ))}
    </View>
  );
}
const st = StyleSheet.create({
  title: { fontFamily: F.teHeavy, fontSize: 30, lineHeight: 42 },
  who: { flex: 1, alignItems: 'center', borderWidth: 2, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 4 },
  rec: { marginTop: 16, borderRadius: 22, paddingVertical: 22, alignItems: 'center' },
  recTxt: { color: '#fff', fontFamily: F.bold, fontSize: 18 },
  msg: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 2, borderRadius: 20, padding: 12 },
  av: { width: 46, height: 46, borderRadius: 23, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  play: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
