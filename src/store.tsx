import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteVoiceFile } from './audio';
import type { Speaker, Teacher } from './content';

export type Profile = { child: string; age: '4-6' | '7-9' | '10-12'; gma: string; gpa: string; kid?: 'boy' | 'girl' };
export type State = {
  profile: Profile | null;
  stars: number;
  learned: string[];
  streak: number;
  lastDay: string | null;
  minutes: Record<string, number>;
  premium: boolean;
  wordVoices: Record<string, Partial<Record<Speaker, string>>>;
  teacher: Teacher;
  scenesDone: string[];
};
const fresh = (): State => ({
  profile: null, stars: 0, learned: [], streak: 0, lastDay: null, minutes: {}, premium: false, wordVoices: {}, teacher: 'both', scenesDone: [],
});
export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const KEY = 'maatalu:v1';

type Ctx = {
  s: State;
  ready: boolean;
  setProfile: (p: Profile) => void;
  learn: (ids: string[]) => void;
  addStars: (n: number) => void;
  finishSession: (minutes: number) => number;
  setPremium: (v: boolean) => void;
  setWordVoice: (wordId: string, who: Speaker, uri: string) => void;
  deleteWordVoice: (wordId: string, who: Speaker) => void;
  setTeacher: (t: Teacher) => void;
  completeScene: (id: string) => boolean;
  resetAll: () => void;
  toast: (msg: string) => void;
  toastMsg: string | null;
};
const C = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<State>(fresh);
  const [ready, setReady] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw);
        // Older builds stored one recording per word as a plain string (Ammamma's).
        const wv: State['wordVoices'] = {};
        for (const [k, v] of Object.entries(saved.wordVoices || {})) wv[k] = typeof v === 'string' ? { gma: v } : (v as State['wordVoices'][string]);
        // Older builds kept "family messages" on the phone. They were never sent anywhere, so clear them.
        (saved.messages || []).forEach((m: { uri?: string }) => m.uri && deleteVoiceFile(m.uri));
        delete saved.messages;
        setS({ ...fresh(), ...saved, wordVoices: wv });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  useEffect(() => { if (ready) AsyncStorage.setItem(KEY, JSON.stringify(s)).catch(() => {}); }, [s, ready]);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastMsg(null), 2600);
  }, []);

  const latest = useRef(s);
  latest.current = s;
  const finishSession = useCallback((minutes: number) => {
    const today = dayKey();
    const y = new Date(); y.setDate(y.getDate() - 1);
    const p0 = latest.current;
    const streak = p0.lastDay === today ? p0.streak : p0.lastDay === dayKey(y) ? p0.streak + 1 : 1;
    setS((p) => ({ ...p, streak, lastDay: today, minutes: { ...p.minutes, [today]: (p.minutes[today] || 0) + minutes } }));
    return streak;
  }, []);

  const value = useMemo<Ctx>(() => ({
    s, ready, toast, toastMsg, finishSession,
    setProfile: (profile) => setS((p) => ({ ...p, profile })),
    learn: (ids) => setS((p) => ({ ...p, learned: Array.from(new Set([...p.learned, ...ids])) })),
    addStars: (n) => setS((p) => ({ ...p, stars: p.stars + n })),
    setPremium: (premium) => setS((p) => ({ ...p, premium })),
    setWordVoice: (wordId, who, uri) => setS((p) => {
      const old = p.wordVoices[wordId]?.[who];
      if (old && old !== uri) deleteVoiceFile(old);
      return { ...p, wordVoices: { ...p.wordVoices, [wordId]: { ...p.wordVoices[wordId], [who]: uri } } };
    }),
    deleteWordVoice: (wordId, who) => setS((p) => {
      const cur = { ...p.wordVoices[wordId] };
      if (cur[who]) deleteVoiceFile(cur[who]!);
      delete cur[who];
      const wordVoices = { ...p.wordVoices };
      if (cur.gma || cur.gpa) wordVoices[wordId] = cur; else delete wordVoices[wordId];
      return { ...p, wordVoices };
    }),
    setTeacher: (teacher) => setS((p) => ({ ...p, teacher })),
    completeScene: (id) => {
      if (latest.current.scenesDone.includes(id)) return false;
      setS((p) => (p.scenesDone.includes(id) ? p : { ...p, scenesDone: [...p.scenesDone, id], stars: p.stars + 3 }));
      return true;
    },
    resetAll: () => setS((p) => {
      Object.values(p.wordVoices).forEach((v) => Object.values(v).forEach((u) => u && deleteVoiceFile(u)));
      return fresh();
    }),
  }), [s, ready, toast, toastMsg, finishSession]);

  return <C.Provider value={value}>{children}</C.Provider>;
}
export const useStore = () => {
  const c = useContext(C);
  if (!c) throw new Error('useStore outside provider');
  return c;
};
