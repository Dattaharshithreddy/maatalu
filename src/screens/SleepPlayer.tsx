import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { F } from '../theme';
import { useStore } from '../store';
import { speakNarrator, stopAll } from '../audio';
import { BED_STORIES } from '../bedtime/stories';
import { BED_AUDIO } from '../bedtime/audio';
import { Moon, NIGHT, NightSky } from '../bedtime/Sky';

type Props = { storyId: string; onClose: () => void };
type Timer = 'end' | 15 | 30;
type AudioPlayer = ReturnType<typeof createAudioPlayer>;

const DIM_AFTER = 12000; // ms without a touch before the screen goes dark
const FADE_MS = 25000;   // how long the sleep timer takes to fade the voice out

export default function SleepPlayer({ storyId, onClose }: Props) {
  const ins = useSafeAreaInsets();
  const { s, finishBedStory } = useStore();
  // Stories the child may hear, starting from the one picked. Longer sleep timers carry on into the next.
  const queue = useRef(BED_STORIES.filter((x) => x.free || s.premium)).current;
  const [qi, setQi] = useState(Math.max(0, queue.findIndex((x) => x.id === storyId)));
  const story = queue[qi] ?? BED_STORIES[0];
  const rec = BED_AUDIO[story.id];

  const [line, setLine] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timer, setTimer] = useState<Timer>('end');
  const [readAlong, setReadAlong] = useState(true);
  const [left, setLeft] = useState<number | null>(null);

  const player = useRef<AudioPlayer | null>(null);
  const ttsStop = useRef<(() => void) | null>(null);
  const ttsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);
  const deadline = useRef<number | null>(null);
  const fading = useRef(false);
  const alive = useRef(true);
  const lineRef = useRef(-1);
  const timerRef = useRef<Timer>('end');
  timerRef.current = timer;

  // ---- dimming ----
  const dim = useRef(new Animated.Value(0)).current;
  const dimTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wake = useCallback(() => {
    Animated.timing(dim, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    if (dimTimer.current) clearTimeout(dimTimer.current);
    dimTimer.current = setTimeout(() => {
      Animated.timing(dim, { toValue: 0.93, duration: 4000, useNativeDriver: true }).start();
    }, DIM_AFTER);
  }, [dim]);

  // ---- engine ----
  const teardown = useCallback(() => {
    if (poll.current) clearInterval(poll.current);
    if (ttsTimer.current) clearTimeout(ttsTimer.current);
    ttsStop.current?.(); ttsStop.current = null;
    const p = player.current; player.current = null;
    if (p) {
      try { p.clearLockScreenControls(); } catch {}
      try { p.pause(); p.remove(); } catch {}
    }
    stopAll();
  }, []);

  const goNext = useCallback(() => {
    finishBedStory(story.id);
    const more = timerRef.current !== 'end' && deadline.current !== null && Date.now() < deadline.current && qi + 1 < queue.length;
    if (more) { setQi(qi + 1); return; }
    setPlaying(false); setFinished(true); setLine(-1);
  }, [finishBedStory, story.id, qi, queue.length]);

  const ttsFrom = useCallback((i: number) => {
    if (!alive.current) return;
    if (i >= story.lines.length) { goNext(); return; }
    lineRef.current = i; setLine(i);
    ttsStop.current = speakNarrator(story.lines[i].te, () => {
      ttsTimer.current = setTimeout(() => ttsFrom(i + 1), 700 + (story.lines[i].p ?? 0) * 1000);
    });
  }, [story, goNext]);

  const start = useCallback(() => {
    teardown();
    setFinished(false); fading.current = false;
    if (rec) {
      const p = createAudioPlayer(rec.file);
      player.current = p;
      try {
        p.setActiveForLockScreen(true, { title: story.te, artist: 'Chandamama · Maatalu', albumTitle: story.title });
      } catch {}
      const sub = p.addListener('playbackStatusUpdate', (st) => {
        if (st.didJustFinish) { sub.remove(); if (alive.current) goNext(); }
      });
      p.play();
      poll.current = setInterval(() => {
        const t = player.current?.currentTime ?? 0;
        let i = 0;
        while (i + 1 < rec.starts.length && rec.starts[i + 1] <= t + 0.15) i++;
        if (t > 0.2 && i !== lineRef.current) { lineRef.current = i; setLine(i); }
      }, 400);
    } else {
      ttsFrom(0);
    }
    setPlaying(true);
  }, [rec, story, teardown, goNext, ttsFrom]);

  const pause = () => {
    if (player.current) player.current.pause();
    else { if (ttsTimer.current) clearTimeout(ttsTimer.current); ttsStop.current?.(); ttsStop.current = null; }
    setPlaying(false);
  };
  const resume = () => {
    if (finished) { start(); return; }
    if (player.current) { player.current.play(); setPlaying(true); }
    else if (!rec) { setPlaying(true); ttsFrom(Math.max(0, lineRef.current)); }
    else start();
  };
  const back15 = () => {
    const p = player.current; if (!p) return;
    p.seekTo(Math.max(0, p.currentTime - 15)).catch(() => {});
  };

  // Audio session: keep playing with the screen locked (lock-screen controls keep Android from cutting it off).
  useEffect(() => {
    alive.current = true;
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMix' }).catch(() => {});
    wake();
    return () => {
      alive.current = false;
      teardown();
      if (dimTimer.current) clearTimeout(dimTimer.current);
      setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false }).catch(() => {});
    };
  }, [teardown, wake]);

  // A new story in the queue starts by itself.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    lineRef.current = -1; setLine(-1); start();
  }, [qi]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sleep timer: counts down, then fades the voice out gently and stops.
  useEffect(() => {
    if (timer === 'end') { deadline.current = null; setLeft(null); return; }
    deadline.current = Date.now() + timer * 60000;
    const iv = setInterval(() => {
      if (!deadline.current) return;
      const ms = deadline.current - Date.now();
      setLeft(Math.max(0, Math.ceil(ms / 60000)));
      if (ms <= 0 && !fading.current) {
        fading.current = true;
        const p = player.current;
        if (!p) { teardown(); setPlaying(false); setFinished(true); return; }
        const t0 = Date.now();
        const f = setInterval(() => {
          const k = 1 - (Date.now() - t0) / FADE_MS;
          if (k <= 0 || !player.current) { clearInterval(f); teardown(); if (alive.current) { setPlaying(false); setFinished(true); } return; }
          try { p.volume = k; } catch {}
        }, 250);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [timer, teardown]);

  const L = line >= 0 ? story.lines[line] : null;
  const timers: [Timer, string][] = [['end', 'Story end'], [15, '15 min'], [30, '30 min']];

  return (
    <View style={{ flex: 1, backgroundColor: NIGHT.top }} onTouchStart={wake}>
      <NightSky top="#070C20" bottom={story.sky[0]} />
      <View style={{ flex: 1, paddingTop: ins.top + 10, paddingBottom: ins.bottom + 18, paddingHorizontal: 22 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pressable onPress={onClose} hitSlop={14} accessibilityLabel="Close"><Text style={st.close}>✕</Text></Pressable>
          <Pressable onPress={() => setReadAlong(!readAlong)} hitSlop={10} accessibilityRole="switch" accessibilityState={{ checked: readAlong }}>
            <Text style={st.toggle}>{readAlong ? 'Words: on' : 'Words: off'}</Text>
          </Pressable>
        </View>

        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Moon size={190} breathing={playing} />
          <Text style={st.title}>{story.te}</Text>
          <Text style={st.sub}>{story.title}</Text>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 12 }}>
          {finished ? (
            <Text style={st.lineTe}>శుభరాత్రి 🌙</Text>
          ) : readAlong && L ? (
            <>
              <Text style={st.lineTe}>{L.te}</Text>
              <Text style={st.lineEn}>{L.en}</Text>
            </>
          ) : !playing ? (
            <Text style={st.hint}>Press play, then put the phone face down or let the screen go dark.</Text>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
          <Pressable onPress={back15} disabled={!player.current} hitSlop={10} accessibilityLabel="Back 15 seconds"
            style={{ opacity: player.current ? 1 : 0.25 }}>
            <Text style={st.small}>↺ 15</Text>
          </Pressable>
          <Pressable onPress={() => (playing ? pause() : line < 0 && !finished && !player.current ? start() : resume())}
            accessibilityRole="button" accessibilityLabel={playing ? 'Pause' : 'Play'} style={st.playBtn}>
            <Text style={st.playIcon}>{playing ? '❚❚' : '▶'}</Text>
          </Pressable>
          <Pressable onPress={start} hitSlop={10} accessibilityLabel="Start again"><Text style={st.small}>⟲</Text></Pressable>
        </View>

        <Text style={st.timerLabel}>Sleep timer{left !== null ? ` · ${left} min left` : ''}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
          {timers.map(([v, label]) => (
            <Pressable key={label} onPress={() => setTimer(v)} accessibilityRole="radio" accessibilityState={{ selected: timer === v }}
              style={[st.chip, timer === v && { backgroundColor: 'rgba(255,231,163,0.18)', borderColor: NIGHT.moon }]}>
              <Text style={[st.chipText, timer === v && { color: NIGHT.moon }]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        {timer !== 'end' && queue.length > 1 && (
          <Text style={st.note}>When this story ends, the next one begins, then the voice fades away.</Text>
        )}
        {!rec && (
          <Text style={st.note}>Read by your device's Telugu voice for now. The recorded narration arrives in the next update.</Text>
        )}
      </View>

      {/* the screen goes dark on its own; a touch brings it back */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#000', opacity: dim }]} />
    </View>
  );
}

const st = StyleSheet.create({
  close: { color: NIGHT.muted, fontSize: 24 },
  toggle: { fontFamily: F.bold, color: NIGHT.muted, fontSize: 14 },
  title: { fontFamily: F.teHeavy, fontSize: 28, color: NIGHT.ink, textAlign: 'center', marginTop: 4 },
  sub: { fontFamily: F.body, color: NIGHT.muted, fontSize: 14, textAlign: 'center' },
  lineTe: { fontFamily: F.te, color: NIGHT.ink, fontSize: 24, textAlign: 'center', lineHeight: 40, opacity: 0.92 },
  lineEn: { fontFamily: F.body, color: NIGHT.muted, fontSize: 15, textAlign: 'center', marginTop: 6 },
  hint: { fontFamily: F.body, color: NIGHT.muted, fontSize: 15, textAlign: 'center', opacity: 0.85 },
  playBtn: { width: 84, height: 84, borderRadius: 42, backgroundColor: NIGHT.moon, alignItems: 'center', justifyContent: 'center',
    shadowColor: NIGHT.glow, shadowOpacity: 0.6, shadowRadius: 18, elevation: 8 },
  playIcon: { fontSize: 30, color: '#2A2200', marginLeft: 3 },
  small: { fontFamily: F.bold, color: NIGHT.ink, fontSize: 20 },
  timerLabel: { fontFamily: F.bold, color: NIGHT.muted, fontSize: 13, textAlign: 'center', marginTop: 22, marginBottom: 8 },
  chip: { borderWidth: 1, borderColor: NIGHT.line, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  chipText: { fontFamily: F.bold, color: NIGHT.ink, fontSize: 14 },
  note: { fontFamily: F.body, color: NIGHT.muted, fontSize: 12, textAlign: 'center', marginTop: 10, opacity: 0.8 },
});
