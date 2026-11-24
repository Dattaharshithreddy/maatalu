import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { F } from '../theme';
import { useStore } from '../store';
import { BED_STORIES, BedStory } from '../bedtime/stories';
import { BED_AUDIO } from '../bedtime/audio';
import { Moon, NIGHT, NightSky } from '../bedtime/Sky';

type Props = { openStory: (id: string) => void; openPaywall: () => void };

/** Minutes the story lasts: from the recording, or estimated from the text. */
export function storyMinutes(st: BedStory) {
  const rec = BED_AUDIO[st.id];
  const secs = rec ? rec.duration : st.lines.reduce((a, l) => a + l.te.length * 0.11 + 1.2 + (l.p ?? 0), 0);
  return Math.max(1, Math.round(secs / 60));
}

export default function Bedtime({ openStory, openPaywall }: Props) {
  const ins = useSafeAreaInsets();
  const { s } = useStore();
  const name = s.profile?.child;

  return (
    <View style={{ flex: 1 }}>
      <NightSky />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: ins.top + 10, paddingBottom: 130 }}>
        <View style={{ alignItems: 'center' }}>
          <Moon size={150} breathing />
          <Text style={st.title}>నిద్ర కథలు</Text>
          <Text style={st.sub}>Bedtime stories, told by Chandamama{name ? ` for ${name}` : ''}</Text>
          <Text style={st.tip}>Dim the lights, tuck in, and press a story. The screen goes dark by itself.</Text>
        </View>

        <View style={{ gap: 14, marginTop: 22 }}>
          {BED_STORIES.map((story) => {
            const lock = !story.free && !s.premium;
            const done = s.bedDone.includes(story.id);
            return (
              <Pressable key={story.id} onPress={() => (lock ? openPaywall() : openStory(story.id))}
                accessibilityRole="button" accessibilityLabel={`${story.title}${lock ? ', locked' : ''}`}
                style={({ pressed }) => [st.card, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
                <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                  <Defs>
                    <LinearGradient id={`c-${story.id}`} x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0" stopColor={story.sky[0]} />
                      <Stop offset="1" stopColor={story.sky[1]} />
                    </LinearGradient>
                  </Defs>
                  <Rect width="100%" height="100%" rx="22" fill={`url(#c-${story.id})`} />
                </Svg>
                <View style={st.icon}><Text style={{ fontSize: 34 }}>{lock ? '👑' : story.icon}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={st.cardTe}>{story.te}</Text>
                  <Text style={st.cardEn} numberOfLines={2}>{story.title}</Text>
                  <Text style={st.meta}>
                    {lock ? 'Included with Maatalu Plus' : `🌙 ${storyMinutes(story)} min${done ? '  ·  ⭐ heard' : ''}`}
                  </Text>
                </View>
                <Text style={st.play}>{lock ? '' : '▶'}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={st.foot}>Calm Telugu narration, slow and soft, made for falling asleep.</Text>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  title: { fontFamily: F.teHeavy, fontSize: 34, color: NIGHT.ink, marginTop: 4 },
  sub: { fontFamily: F.bold, color: NIGHT.muted, fontSize: 15, textAlign: 'center' },
  tip: { fontFamily: F.body, color: NIGHT.muted, fontSize: 13, textAlign: 'center', marginTop: 8, opacity: 0.8, maxWidth: 320 },
  card: { minHeight: 104, borderRadius: 22, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14,
    borderWidth: 1, borderColor: NIGHT.line },
  icon: { width: 62, height: 62, borderRadius: 31, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  cardTe: { fontFamily: F.te, color: NIGHT.ink, fontSize: 20 },
  cardEn: { fontFamily: F.body, color: NIGHT.muted, fontSize: 14 },
  meta: { fontFamily: F.bold, color: NIGHT.moon, fontSize: 13, marginTop: 4 },
  play: { color: NIGHT.moon, fontSize: 22, width: 24, textAlign: 'center' },
  foot: { fontFamily: F.body, color: NIGHT.muted, fontSize: 12, textAlign: 'center', marginTop: 22, opacity: 0.7 },
});
