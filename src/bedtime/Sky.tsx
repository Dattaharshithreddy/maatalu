import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

export const NIGHT = {
  top: '#0B1330', bottom: '#1E2A5C', ink: '#F4EFDC', muted: '#A9B2D6', card: 'rgba(255,255,255,0.07)',
  line: 'rgba(255,255,255,0.12)', moon: '#FFE7A3', glow: '#FFD36B',
};

/** Deterministic pseudo-random so the stars stay put between renders. */
const rand = (i: number) => { const x = Math.sin(i * 9301 + 49297) * 233280; return x - Math.floor(x); };

/** Full-screen night sky with softly twinkling stars. */
export function NightSky({ top = NIGHT.top, bottom = NIGHT.bottom, stars = 46 }: { top?: string; bottom?: string; stars?: number }) {
  const tw = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(tw, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(tw, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [tw]);
  const pts = useMemo(() => Array.from({ length: stars }, (_, i) => ({ x: rand(i) * 100, y: rand(i + 99) * 70, r: 0.6 + rand(i + 7) * 1.4, b: i % 2 })), [stars]);
  const layer = (b: number) => (
    <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
      {pts.filter((p) => p.b === b).map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={p.r * 0.18} fill="#fff" opacity={0.85} />)}
    </Svg>
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={top} />
            <Stop offset="1" stopColor={bottom} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#sky)" />
      </Svg>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: tw.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) }]}>{layer(0)}</Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: tw.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] }) }]}>{layer(1)}</Animated.View>
    </View>
  );
}

/** Chandamama: a sleepy, smiling full moon with a soft glow. `breathing` makes the glow rise and fall. */
export function Moon({ size = 160, breathing = false }: { size?: number; breathing?: boolean }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!breathing) return;
    // About six breaths a minute: slow enough to breathe along with.
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: 4500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(a, { toValue: 0, duration: 5500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [a, breathing]);
  const scale = a.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.08] });
  const glow = a.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.9] });
  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: glow, transform: [{ scale }] }]}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Defs>
            <RadialGradient id="g" cx="50%" cy="50%" r="50%">
              <Stop offset="0.35" stopColor={NIGHT.glow} stopOpacity="0.55" />
              <Stop offset="1" stopColor={NIGHT.glow} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="100" cy="100" r="100" fill="url(#g)" />
        </Svg>
      </Animated.View>
      <Svg width={size} height={size} viewBox="0 0 200 200" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="m" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFF4CC" />
            <Stop offset="1" stopColor="#FFCF5C" />
          </LinearGradient>
        </Defs>
        {/* a full, round, sleepy moon: the same face as the app icon */}
        <Circle cx="100" cy="100" r="58" fill="url(#m)" />
        <Circle cx="78" cy="78" r="9" fill="#F2C24E" opacity="0.6" />
        <Circle cx="128" cy="122" r="6" fill="#F2C24E" opacity="0.6" />
        <G stroke="#7A4E0E" strokeWidth="4.5" strokeLinecap="round" fill="none">
          <Path d="M72 98 Q80 106 88 98" />
          <Path d="M112 98 Q120 106 128 98" />
          <Path d="M90 120 Q100 128 110 120" />
        </G>
        <Circle cx="70" cy="114" r="7" fill="#FF9E8A" opacity="0.5" />
        <Circle cx="130" cy="114" r="7" fill="#FF9E8A" opacity="0.5" />
      </Svg>
    </View>
  );
}
