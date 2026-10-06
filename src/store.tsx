import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteVoiceFile } from './audio';

export type Profile = { child: string; age: '4-6' | '7-9' | '10-12'; gma: string; gpa: string };
export type Message = { id: string; who: 'child' | 'gma' | 'gpa'; uri: string; seconds: number; at: number };
export type State = {
  profile: Profile | null;
  stars: number;
  learned: string[];
  streak: number;
  lastDay: string | null;
  minutes: Record<string, number>;
  premium: boolean;
  messages: Message[];
  wordVoices: Record<string, string>;
};
const fresh = (): State => ({
  profile: null, stars: 0, learned: [], streak: 0, lastDay: null, minutes: {}, premium: false, messages: [], wordVoices: {},
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
  addMessage: (m: Message) => void;
  deleteMessage: (id: string) => void;
  setWordVoice: (wordId: string, uri: string) => void;
  deleteWordVoice: (wordId: string) => void;
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
      .then((raw) => { if (raw) setS({ ...fresh(), ...JSON.parse(raw) }); })
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
    addMessage: (m) => setS((p) => ({ ...p, messages: [m, ...p.messages] })),
    deleteMessage: (id) => setS((p) => {
      const m = p.messages.find((x) => x.id === id);
      if (m) deleteVoiceFile(m.uri);
      return { ...p, messages: p.messages.filter((x) => x.id !== id) };
    }),
    setWordVoice: (wordId, uri) => setS((p) => {
      if (p.wordVoices[wordId]) deleteVoiceFile(p.wordVoices[wordId]);
      return { ...p, wordVoices: { ...p.wordVoices, [wordId]: uri } };
    }),
    deleteWordVoice: (wordId) => setS((p) => {
      if (p.wordVoices[wordId]) deleteVoiceFile(p.wordVoices[wordId]);
      const wordVoices = { ...p.wordVoices }; delete wordVoices[wordId];
      return { ...p, wordVoices };
    }),
    resetAll: () => setS((p) => {
      p.messages.forEach((m) => deleteVoiceFile(m.uri));
      Object.values(p.wordVoices).forEach(deleteVoiceFile);
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
