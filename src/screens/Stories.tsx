import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { F, useTheme } from '../theme';
import { Chip } from '../ui';
import { useStore } from '../store';
import { CHAPTERS } from '../stories/scenes';
import { SceneThumb } from '../stories/SceneCanvas';
import { Portrait } from '../stories/Actor';

type Props = { openScene: (chapterId: string, index: number) => void; openPaywall: () => void };

export default function Stories({ openScene, openPaywall }: Props) {
  const t = useTheme();
  const ins = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { s } = useStore();
  const p = s.profile!;
  const [open, setOpen] = useState<string | null>(null);
  const locked = (free: boolean) => !free && !s.premium;
  const total = CHAPTERS.reduce((a, c) => a + c.scenes.length, 0);
  const pad = { paddingHorizontal: 18, paddingTop: ins.top + 12, paddingBottom: 130 };

  const chapter = CHAPTERS.find((c) => c.id === open);
  if (chapter) {
    const cardW = (Math.min(width, 720) - 18 * 2 - 12) / 2;
    return (
      <ScrollView contentContainerStyle={pad}>
        <Pressable onPress={() => setOpen(null)} hitSlop={10}><Text style={{ fontFamily: F.bold, color: t.leaf, fontSize: 16 }}>‹ All stories</Text></Pressable>
        <Text style={[st.title, { color: t.ink }]}>{chapter.icon} {chapter.te}</Text>
        <Text style={{ fontFamily: F.bold, color: t.muted, marginBottom: 14 }}>{chapter.title}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {chapter.scenes.map((sc, i) => {
            const done = s.scenesDone.includes(sc.id);
            return (
              <Pressable key={sc.id} onPress={() => openScene(chapter.id, i)} accessibilityRole="button" accessibilityLabel={sc.title}
                style={[st.scene, { width: cardW, backgroundColor: t.surface, borderColor: done ? t.turmeric : t.line }]}>
                <View>
                  <SceneThumb scene={sc} width={cardW - 4} />
                  <View style={st.faces}>
                    {Array.from(new Set(sc.cast.map((c) => c.who))).map((w) => (
                      <View key={w} style={[st.face, { backgroundColor: t.surface, borderColor: t.line }]}>
                        <Portrait id={w === 'kid' ? p.kid ?? 'boy' : w} size={30} />
                      </View>
                    ))}
                  </View>
                </View>
                <View style={{ padding: 8 }}>
                  <Text style={{ fontFamily: F.te, color: t.ink, fontSize: 16 }} numberOfLines={1}>{sc.te}</Text>
                  <Text style={{ fontFamily: F.body, color: t.muted, fontSize: 13 }} numberOfLines={1}>{i + 1}. {sc.title}{done ? '  ⭐' : ''}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={pad}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Portrait id={p.kid ?? 'boy'} size={64} />
        <View style={{ flex: 1 }}>
          <Text style={[st.title, { color: t.ink, marginTop: 0 }]}>కథలు</Text>
          <Text style={{ fontFamily: F.body, color: t.muted }}>Watch the family talk, then play {p.child}'s part.</Text>
        </View>
        <Chip text={`🎭 ${s.scenesDone.length}/${total}`} />
      </View>

      <View style={{ gap: 12, marginTop: 16 }}>
        {CHAPTERS.map((c) => {
          const n = c.scenes.filter((x) => s.scenesDone.includes(x.id)).length;
          const lock = locked(c.free);
          return (
            <Pressable key={c.id} onPress={() => (lock ? openPaywall() : setOpen(c.id))} accessibilityRole="button" accessibilityLabel={c.title}
              style={[st.ch, { backgroundColor: t.surface, borderColor: t.line, opacity: lock ? 0.7 : 1 }]}>
              <View style={[st.ic, { backgroundColor: n === c.scenes.length ? t.turmericSoft : t.leafSoft }]}>
                <Text style={{ fontSize: 28 }}>{lock ? '👑' : c.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: F.te, color: t.ink, fontSize: 19 }}>{c.te}</Text>
                <Text style={{ fontFamily: F.body, color: t.muted, fontSize: 14 }}>{lock ? `${c.title} · Included with Maatalu Plus` : `${c.title} · ${n} of ${c.scenes.length} scenes`}</Text>
                <View style={[st.bar, { backgroundColor: t.line }]}>
                  <View style={{ width: `${(n / c.scenes.length) * 100}%`, height: '100%', backgroundColor: t.leaf, borderRadius: 9 }} />
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  title: { fontFamily: F.teHeavy, fontSize: 28, marginTop: 6 },
  ch: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2, borderRadius: 20, padding: 12 },
  ic: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  bar: { height: 8, borderRadius: 9, marginTop: 6, overflow: 'hidden' },
  scene: { borderWidth: 2, borderRadius: 16, overflow: 'hidden' },
  faces: { position: 'absolute', left: 6, bottom: 6, flexDirection: 'row', gap: 4 },
  face: { borderRadius: 18, borderWidth: 2, overflow: 'hidden' },
});
