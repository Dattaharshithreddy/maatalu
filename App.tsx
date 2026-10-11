import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, BalooTammudu2_700Bold, BalooTammudu2_800ExtraBold } from '@expo-google-fonts/baloo-tammudu-2';
import { Nunito_600SemiBold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { setAudioModeAsync } from 'expo-audio';
import { F, useTheme } from './src/theme';
import { StoreProvider, useStore } from './src/store';
import { Toast } from './src/ui';
import { checkTeluguVoice, stopAll } from './src/audio';
import Onboarding from './src/screens/Onboarding';
import Home from './src/screens/Home';
import Lesson, { LessonMode } from './src/screens/Lesson';
import Parents from './src/screens/Parents';
import Paywall from './src/screens/Paywall';
import Stories from './src/screens/Stories';
import ScenePlayer from './src/screens/ScenePlayer';

type Tab = 'home' | 'stories' | 'parents';

function Root() {
  const t = useTheme();
  const ins = useSafeAreaInsets();
  const { s, ready, toastMsg } = useStore();
  const [tab, setTab] = useState<Tab>('home');
  const [lesson, setLesson] = useState<LessonMode | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [scene, setScene] = useState<{ chapterId: string; index: number } | null>(null);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    checkTeluguVoice();
  }, []);

  if (!ready) return <View style={{ flex: 1, backgroundColor: t.bg }} />;
  if (!s.profile) return (<><Onboarding /><Toast msg={toastMsg} bottom={ins.bottom + 30} /></>);

  const go = (x: Tab) => { stopAll(); setTab(x); };
  const tabs: [Tab, string, string][] = [['home', '🏡', 'Learn'], ['stories', '🎭', 'Stories'], ['parents', '🌱', 'For parents']];

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {tab === 'home' && (
        <Home openUnit={(index) => setLesson({ kind: 'unit', index })} openReview={() => setLesson({ kind: 'review' })}
          openPaywall={() => setPaywall(true)} />
      )}
      {tab === 'stories' && <Stories openScene={(chapterId, index) => setScene({ chapterId, index })} openPaywall={() => setPaywall(true)} />}
      {tab === 'parents' && <Parents openPaywall={() => setPaywall(true)} />}

      <View style={[st.tabs, { backgroundColor: t.surface, borderTopColor: t.line, paddingBottom: ins.bottom }]}>
        {tabs.map(([id, e, label]) => (
          <Pressable key={id} onPress={() => go(id)} style={st.tab} accessibilityRole="tab" accessibilityState={{ selected: tab === id }}>
            <Text style={{ fontSize: 22, opacity: tab === id ? 1 : 0.5 }}>{e}</Text>
            <Text style={{ fontFamily: F.bold, fontSize: 13, color: tab === id ? t.leaf : t.muted }}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <Modal visible={!!lesson} animationType="slide" onRequestClose={() => setLesson(null)} statusBarTranslucent>
        {lesson && (
          <Lesson mode={lesson} onClose={() => { stopAll(); setLesson(null); }} />
        )}
        <Toast msg={toastMsg} bottom={ins.bottom + 110} />
      </Modal>
      <Modal visible={!!scene} animationType="slide" onRequestClose={() => { stopAll(); setScene(null); }} statusBarTranslucent>
        {scene && (
          <ScenePlayer chapterId={scene.chapterId} sceneIndex={scene.index} onClose={() => { stopAll(); setScene(null); }}
            onGo={(index) => setScene({ ...scene, index })} />
        )}
        <Toast msg={toastMsg} bottom={ins.bottom + 40} />
      </Modal>
      <Modal visible={paywall} animationType="slide" onRequestClose={() => setPaywall(false)} statusBarTranslucent>
        <Paywall onClose={() => setPaywall(false)} />
      </Modal>
      <Toast msg={toastMsg} bottom={ins.bottom + 86} />
    </View>
  );
}

export default function App() {
  const [loaded] = useFonts({ BalooTammudu2_700Bold, BalooTammudu2_800ExtraBold, Nunito_600SemiBold, Nunito_800ExtraBold });
  if (!loaded) return null;
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="auto" />
        <Root />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
const st = StyleSheet.create({
  tabs: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', borderTopWidth: 2 },
  tab: { flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 10, gap: 2 },
});
