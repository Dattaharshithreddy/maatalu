import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { F, Theme, useTheme } from './theme';

type BtnProps = {
  label: string; onPress?: () => void; variant?: 'primary' | 'ghost' | 'danger' | 'leaf';
  disabled?: boolean; style?: StyleProp<ViewStyle>; onPressIn?: () => void; onPressOut?: () => void; a11y?: string;
};
export function Btn({ label, onPress, variant = 'primary', disabled, style, onPressIn, onPressOut, a11y }: BtnProps) {
  const t = useTheme();
  const c = colors(t, variant);
  return (
    <Pressable
      accessibilityRole="button" accessibilityLabel={a11y || label} disabled={disabled}
      onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}
      style={({ pressed }) => [
        b.btn, { backgroundColor: c.bg, borderColor: c.border, opacity: disabled ? 0.4 : 1,
          shadowColor: c.shadow, transform: [{ translateY: pressed ? 3 : 0 }], borderBottomWidth: pressed ? 2 : 5 },
        style,
      ]}>
      <Text style={[b.label, { color: c.fg }]}>{label}</Text>
    </Pressable>
  );
}
function colors(t: Theme, v: BtnProps['variant']) {
  switch (v) {
    case 'ghost': return { bg: t.surface, fg: t.ink, border: t.line, shadow: t.line };
    case 'danger': return { bg: t.kumkum, fg: '#fff', border: '#9E1426', shadow: t.kumkum };
    case 'leaf': return { bg: t.leaf, fg: t.onLeaf, border: '#134A36', shadow: t.leaf };
    default: return { bg: t.turmeric, fg: t.onTurmeric, border: t.turmericShadow, shadow: t.turmeric };
  }
}
const b = StyleSheet.create({
  btn: { borderRadius: 16, paddingVertical: 13, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 0 },
  label: { fontFamily: F.bold, fontSize: 17 },
});

/** Muggulu-style dot grid, drawn behind the big Telugu letters. */
export function Muggulu({ color, size = 240, n = 5 }: { color: string; size?: number; n?: number }) {
  const gap = size / n;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', width: size, height: size, alignSelf: 'center', top: '50%', marginTop: -size / 2 }}>
      {Array.from({ length: n * n }).map((_, i) => (
        <View key={i} style={{ position: 'absolute', width: 7, height: 7, borderRadius: 4, backgroundColor: color,
          left: (i % n) * gap + gap / 2 - 3.5, top: Math.floor(i / n) * gap + gap / 2 - 3.5 }} />
      ))}
      <View style={{ position: 'absolute', left: gap * 0.5, top: gap * 0.5, width: size - gap, height: size - gap,
        borderRadius: size, borderWidth: 2, borderColor: color, transform: [{ rotate: '45deg' }] }} />
    </View>
  );
}

export function Chip({ text }: { text: string }) {
  const t = useTheme();
  return (
    <View style={{ backgroundColor: t.surface, borderColor: t.line, borderWidth: 2, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ fontFamily: F.bold, color: t.ink, fontSize: 15 }}>{text}</Text>
    </View>
  );
}

export function Toast({ msg, bottom }: { msg: string | null; bottom: number }) {
  const t = useTheme();
  if (!msg) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 20, right: 20, bottom, alignItems: 'center', zIndex: 50 }}>
      <View style={{ backgroundColor: t.ink, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10 }}>
        <Text style={{ color: t.bg, fontFamily: F.bold, fontSize: 14, textAlign: 'center' }}>{msg}</Text>
      </View>
    </View>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return <Text style={{ fontFamily: F.te, fontSize: 22, color: t.ink, marginTop: 22, marginBottom: 8 }}>{children}</Text>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return <View style={[{ backgroundColor: t.surface, borderColor: t.line, borderWidth: 2, borderRadius: 22, padding: 14 }, style]}>{children}</View>;
}

export const whoName = (who: 'child' | 'gma' | 'gpa', p: { child: string; gma: string; gpa: string }) =>
  who === 'child' ? p.child : who === 'gma' ? p.gma : p.gpa;
export const whoEmoji = (who: 'child' | 'gma' | 'gpa') => (who === 'child' ? '🧒' : who === 'gma' ? '👵' : '👴');
export function ago(ts: number) {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}
