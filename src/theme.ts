import { useColorScheme } from 'react-native';

const light = {
  leaf: '#1F6B4F', leafSoft: '#D6EBE1', turmeric: '#F2B705', turmericSoft: '#FFF3C4', turmericShadow: '#B88A00',
  kumkum: '#D7263D', kumkumSoft: '#FCE1E4', bg: '#EEF6F1', surface: '#FFFFFF', ink: '#1B2A24',
  muted: '#5C6F66', line: '#D5E4DC', dot: 'rgba(31,107,79,0.18)', onLeaf: '#FFFFFF', onTurmeric: '#2A2200',
};
const dark: typeof light = {
  leaf: '#5CC498', leafSoft: '#1B3A2F', turmeric: '#F5C534', turmericSoft: '#3A3115', turmericShadow: '#8A6A00',
  kumkum: '#FF6B7D', kumkumSoft: '#3B1C22', bg: '#0F1F19', surface: '#172E26', ink: '#EAF4EF',
  muted: '#9DB4A9', line: '#29463B', dot: 'rgba(92,196,152,0.16)', onLeaf: '#0F1F19', onTurmeric: '#2A2200',
};
export type Theme = typeof light;
export const useTheme = (): Theme => (useColorScheme() === 'dark' ? dark : light);

export const F = {
  te: 'BalooTammudu2_700Bold',
  teHeavy: 'BalooTammudu2_800ExtraBold',
  body: 'Nunito_600SemiBold',
  bold: 'Nunito_800ExtraBold',
};
