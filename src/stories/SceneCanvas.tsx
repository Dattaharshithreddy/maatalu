import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import Actor, { actorBox, ArtId } from './Actor';
import { BACKGROUNDS, BG_DEFS, PROPS, SCREEN } from './art';
import type { Gesture, Place, PropPlace, Scene, Who } from './types';

export const SCENE_W = 1200;
export const SCENE_H = 900;

const propsSvg = (list: PropPlace[]) =>
  list.map(([id, x, y, s = 1]) => (PROPS[id] ? `<g transform="translate(${x} ${y}) scale(${s})">${PROPS[id]}</g>` : '')).join('');

export function backgroundXml(scene: Pick<Scene, 'bg' | 'props'>) {
  const back = scene.props.filter((p) => !p[4]);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SCENE_W} ${SCENE_H}">${BG_DEFS}${BACKGROUNDS[scene.bg] ?? ''}${propsSvg(back)}</svg>`;
}

const Backdrop = memo(function Backdrop({ xml }: { xml: string }) {
  return <SvgXml xml={xml} width="100%" height="100%" style={StyleSheet.absoluteFill} />;
});

type Props = {
  scene: Scene;
  width: number;
  kid: 'boy' | 'girl';
  speaking: Who | null;
  gesture: Gesture | null;
  happy?: boolean;
  onTapActor?: (who: Who) => void;
};

/** Draws a scene at the given width: background, characters (some inside the video-call screen), then front props. */
export default function SceneCanvas({ scene, width, kid, speaking, gesture, happy, onTapActor }: Props) {
  const k = width / SCENE_W;
  const bg = useMemo(() => backgroundXml(scene), [scene]);
  const front = useMemo(() => {
    const f = scene.props.filter((p) => p[4]);
    return f.length ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SCENE_W} ${SCENE_H}">${BG_DEFS}${propsSvg(f)}</svg>` : '';
  }, [scene]);

  const art = (who: Who): ArtId => (who === 'kid' ? kid : who);
  const place = (p: Place, ox = 0, oy = 0) => {
    const b = actorBox(p.s);
    return { left: (p.x + b.left - ox) * k, top: (p.y + b.top - oy) * k };
  };
  const actor = (p: Place, ox = 0, oy = 0) => {
    const pos = place(p, ox, oy);
    const isSpeaker = speaking === p.who;
    return (
      <View key={`${p.who}${p.screen ? 's' : ''}`} style={{ position: 'absolute', left: pos.left, top: pos.top }} pointerEvents="box-none">
        <Actor id={art(p.who)} scale={p.s * k} speaking={isSpeaker} gesture={isSpeaker ? gesture : null} happy={happy}
          onPress={() => onTapActor?.(p.who)} />
      </View>
    );
  };

  const [sx, sy, sw, sh] = SCREEN;
  const onScreen = scene.cast.filter((p) => p.screen);
  const onStage = scene.cast.filter((p) => !p.screen);

  return (
    <View style={{ width, height: SCENE_H * k, overflow: 'hidden' }}>
      <Backdrop xml={bg} />
      {onScreen.length > 0 && (
        <View style={{ position: 'absolute', left: sx * k, top: sy * k, width: sw * k, height: sh * k, overflow: 'hidden', borderRadius: 16 * k }}>
          {onScreen.map((p) => actor(p, sx, sy))}
        </View>
      )}
      {onStage.map((p) => actor(p))}
      {!!front && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Backdrop xml={front} />
        </View>
      )}
    </View>
  );
}

/** Background-only thumbnail for lists. */
export const SceneThumb = memo(function SceneThumb({ scene, width }: { scene: Scene; width: number }) {
  const xml = useMemo(() => backgroundXml(scene), [scene]);
  return <View style={{ width, height: (width * SCENE_H) / SCENE_W }}><SvgXml xml={xml} width="100%" height="100%" /></View>;
});
