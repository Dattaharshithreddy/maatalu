import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { ACTOR_VIEWBOX, CHARS, CharArt, EyeState, Viseme } from './art';
import type { Gesture } from './types';

export type ArtId = keyof typeof CHARS;

const [VX, VY, VW, VH] = ACTOR_VIEWBOX;
const FEET_Y = 192;
const wrap = (inner: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VX} ${VY} ${VW} ${VH}">${inner}</svg>`;

/** Every layer wrapped as its own SVG document, built once per character. */
type Wrapped = { armL: string; armR: string; body: string; head: string; top: string; eyes: Record<EyeState, string>; mouth: Record<Viseme, string> };
const cache: Partial<Record<ArtId, Wrapped>> = {};
function layers(id: ArtId): Wrapped {
  if (cache[id]) return cache[id]!;
  const c: CharArt = CHARS[id];
  const map = <K extends string>(o: Record<K, string>) =>
    Object.fromEntries(Object.entries(o).map(([k, v]) => [k, wrap(v as string)])) as Record<K, string>;
  const w: Wrapped = {
    armL: wrap(c.armL), armR: wrap(c.armR), body: wrap(c.body), head: wrap(c.head), top: c.top ? wrap(c.top) : '',
    eyes: map(c.eyes), mouth: map(c.mouth),
  };
  cache[id] = w;
  return w;
}

/** Actor frame size for a given scale, in scene units. */
export const actorBox = (s: number) => ({ w: VW * s, h: VH * s, left: VX * s, top: -(FEET_Y - VY) * s });

const Layer = memo(function Layer({ xml, w, h }: { xml: string; w: number; h: number }) {
  if (!xml) return null;
  return <SvgXml xml={xml} width={w} height={h} style={{ position: 'absolute', left: 0, top: 0 }} />;
});

/** Pixel offset of an actor-frame point from the centre of a w x h box (React Native rotates around the centre). */
const fromCentre = ([x, y]: [number, number], w: number, h: number) => ({
  dx: ((x - VX) / VW) * w - w / 2,
  dy: ((y - VY) / VH) * h - h / 2,
});

/** Arm angles (degrees) and swing for each gesture. Positive turns clockwise. */
const POSE: Record<Gesture | 'rest', { l: number; r: number; al: number; ar: number; period: number }> = {
  rest: { l: 5, r: -5, al: 2.5, ar: 2.5, period: 2400 },
  talk: { l: 7, r: -26, al: 3, ar: 12, period: 650 },
  wave: { l: 6, r: -150, al: 2, ar: 18, period: 300 },
  cheer: { l: 150, r: -150, al: 12, ar: -12, period: 280 },
  point: { l: 5, r: -82, al: 2, ar: 4, period: 900 },
  namaste: { l: -34, r: 34, al: 1, ar: -1, period: 1200 },
  clap: { l: -28, r: 28, al: -12, ar: 12, period: 200 },
  nod: { l: 6, r: -8, al: 2, ar: 3, period: 900 },
};

type Props = {
  id: ArtId;
  /** Scene-to-pixel factor times the actor's own scale. */
  scale: number;
  speaking: boolean;
  gesture: Gesture | null;
  happy?: boolean;
  onPress?: () => void;
};

/**
 * A character made of stacked layers. Body breathes and sways, the head tilts, arms swing and gesture,
 * eyes blink and the mouth cycles through lip shapes while the character is speaking.
 */
export default function Actor({ id, scale, speaking, gesture, happy, onPress }: Props) {
  const L = layers(id);
  const art = CHARS[id];
  const box = actorBox(scale);

  const breathe = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const headIdle = useRef(new Animated.Value(0)).current;
  const osc = useRef(new Animated.Value(0)).current;
  const baseL = useRef(new Animated.Value(POSE.rest.l)).current;
  const baseR = useRef(new Animated.Value(POSE.rest.r)).current;
  const ampL = useRef(new Animated.Value(POSE.rest.al)).current;
  const ampR = useRef(new Animated.Value(POSE.rest.ar)).current;
  const hop = useRef(new Animated.Value(0)).current;
  const nod = useRef(new Animated.Value(0)).current;

  const [eye, setEye] = useState<EyeState>('open');
  const [mouth, setMouth] = useState<Viseme>('rest');
  const [tapHappy, setTapHappy] = useState(false);

  // Idle life: breathing, swaying and a slow head tilt, each with its own rhythm so a crowd never moves in sync.
  useEffect(() => {
    const loop = (v: Animated.Value, ms: number, delay: number) => Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(v, { toValue: 1, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(v, { toValue: -1, duration: ms * 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    const a = [loop(breathe, 900 + Math.random() * 300, Math.random() * 600), loop(sway, 1500 + Math.random() * 500, Math.random() * 800),
      loop(headIdle, 1200 + Math.random() * 600, Math.random() * 900)];
    a.forEach((x) => x.start());
    return () => a.forEach((x) => x.stop());
  }, [breathe, sway, headIdle]);

  // Gestures: arms glide to the new pose, then swing at the gesture's own speed.
  const pose = POSE[gesture ?? (speaking ? 'talk' : 'rest')];
  useEffect(() => {
    const spring = (v: Animated.Value, to: number) => Animated.spring(v, { toValue: to, friction: 6, tension: 60, useNativeDriver: true });
    Animated.parallel([spring(baseL, pose.l), spring(baseR, pose.r), spring(ampL, pose.al), spring(ampR, pose.ar)]).start();
    osc.setValue(0);
    const swing = Animated.loop(Animated.sequence([
      Animated.timing(osc, { toValue: 1, duration: pose.period / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(osc, { toValue: -1, duration: pose.period, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(osc, { toValue: 0, duration: pose.period / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    swing.start();
    return () => swing.stop();
  }, [pose, baseL, baseR, ampL, ampR, osc]);

  // Speaking: a little bounce, and nodding for "nod" lines.
  useEffect(() => {
    const big = gesture === 'cheer' || gesture === 'clap';
    if (!speaking && !big) { Animated.spring(hop, { toValue: 0, useNativeDriver: true }).start(); return; }
    const up = big ? -16 : -5;
    const b = Animated.loop(Animated.sequence([
      Animated.timing(hop, { toValue: up, duration: big ? 170 : 240, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(hop, { toValue: 0, duration: big ? 170 : 240, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]));
    b.start();
    return () => b.stop();
  }, [speaking, gesture, hop]);
  useEffect(() => {
    if (gesture !== 'nod' || !speaking) { nod.setValue(0); return; }
    const n = Animated.loop(Animated.sequence([
      Animated.timing(nod, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(nod, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]));
    n.start();
    return () => n.stop();
  }, [gesture, speaking, nod]);

  // Blinking at random moments, sometimes twice.
  useEffect(() => {
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const blink = () => {
      ['half', 'closed', 'half', 'open'].forEach((e, i) => timers.push(setTimeout(() => alive && setEye(e as EyeState), i * 55)));
    };
    const next = () => {
      timers.push(setTimeout(() => {
        if (!alive) return;
        blink();
        if (Math.random() < 0.25) timers.push(setTimeout(blink, 300));
        next();
      }, 1800 + Math.random() * 3200));
    };
    next();
    return () => { alive = false; timers.forEach(clearTimeout); };
  }, []);

  // Lip sync: cycle through mouth shapes while speaking.
  useEffect(() => {
    if (!speaking) { setMouth('rest'); return; }
    const seq: Viseme[] = ['A', 'E', 'O', 'MBP', 'A', 'U', 'E', 'rest', 'FV', 'O', 'A', 'E'];
    let i = Math.floor(Math.random() * seq.length);
    const t = setInterval(() => { i += 1 + Math.floor(Math.random() * 2); setMouth(seq[i % seq.length]); }, 95);
    return () => clearInterval(t);
  }, [speaking]);

  const joyful = happy || tapHappy || gesture === 'cheer' || gesture === 'clap';
  const showEye: EyeState = eye !== 'open' ? eye : joyful && !speaking ? 'happy' : 'open';
  const showMouth: Viseme = speaking ? mouth : joyful ? 'smile' : 'rest';

  const tap = () => {
    setTapHappy(true);
    Animated.sequence([
      Animated.timing(hop, { toValue: -34, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(hop, { toValue: 0, friction: 3, tension: 120, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setTapHappy(false), 1300);
    onPress?.();
  };

  const deg = (v: Animated.AnimatedInterpolation<number> | Animated.Value, range = 360) =>
    v.interpolate({ inputRange: [-range, range], outputRange: [`-${range}deg`, `${range}deg`] });
  const armL = deg(Animated.add(baseL, Animated.multiply(osc, ampL)));
  const armR = deg(Animated.add(baseR, Animated.multiply(osc, ampR)));
  const bodyRot = sway.interpolate({ inputRange: [-1, 1], outputRange: ['-1.4deg', '1.4deg'] });
  const scaleY = breathe.interpolate({ inputRange: [-1, 1], outputRange: [0.988, 1.014] });
  const scaleX = breathe.interpolate({ inputRange: [-1, 1], outputRange: [1.006, 0.994] });
  const headRot = Animated.add(headIdle.interpolate({ inputRange: [-1, 1], outputRange: [-2.6, 2.6] }), nod.interpolate({ inputRange: [0, 1], outputRange: [0, 5] }));
  const headY = nod.interpolate({ inputRange: [0, 1], outputRange: [0, 4 * scale] });

  const W = box.w, H = box.h;
  const frame = { position: 'absolute' as const, left: 0, top: 0, width: W, height: H };
  // Rotate/scale around a pivot: move the pivot to the centre, transform, move it back.
  const around = (pt: [number, number], t: object[]) => {
    const { dx, dy } = fromCentre(pt, W, H);
    return [{ translateX: dx }, { translateY: dy }, ...t, { translateX: -dx }, { translateY: -dy }];
  };
  return (
    <Pressable onPress={tap} accessibilityRole="button" accessibilityLabel={id} style={{ width: W, height: H }}>
      <Animated.View collapsable={false} style={[frame, { transform: [{ translateY: hop }, ...around([0, FEET_Y], [{ rotate: bodyRot }, { scaleY }, { scaleX }])] as any }]}>
        <Animated.View collapsable={false} style={[frame, { transform: around(art.pivots.armL, [{ rotate: armL }]) as any }]}><Layer xml={L.armL} w={W} h={H} /></Animated.View>
        <Layer xml={L.body} w={W} h={H} />
        <Animated.View collapsable={false} style={[frame, { transform: around(art.pivots.armR, [{ rotate: armR }]) as any }]}><Layer xml={L.armR} w={W} h={H} /></Animated.View>
        <Animated.View collapsable={false} style={[frame, { transform: [{ translateY: headY }, ...around(art.pivots.neck, [{ rotate: deg(headRot, 30) }])] as any }]}>
          <Layer xml={L.head} w={W} h={H} />
          <Layer xml={L.eyes[showEye]} w={W} h={H} />
          <Layer xml={L.mouth[showMouth]} w={W} h={H} />
          <Layer xml={L.top} w={W} h={H} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

/** A still portrait of a character's face (for pickers). */
export const Portrait = memo(function Portrait({ id, size }: { id: ArtId; size: number }) {
  const c = CHARS[id];
  const [nx, ny] = c.pivots.neck;
  const xml = useMemo(() => {
    const vb = `${nx - 150} ${ny - 290} 300 300`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${c.head}${c.eyes.open}${c.mouth.smile}${c.top}</svg>`;
  }, [c, nx, ny]);
  return <View style={{ width: size, height: size }}><SvgXml xml={xml} width="100%" height="100%" /></View>;
});
