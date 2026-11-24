import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import type { ThemePreference } from '@/infrastructure/storage/repository';

import { darkColors, lightColors, type ColorTokens } from './tokens';

const ThemeContext = createContext<ColorTokens>(lightColors);

export function ThemeProvider({ preference, children }: { preference: ThemePreference; children: ReactNode }) {
  const system = useColorScheme();
  const scheme = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  return <ThemeContext.Provider value={scheme === 'dark' ? darkColors : lightColors}>{children}</ThemeContext.Provider>;
}

export function useColors(): ColorTokens {
  return useContext(ThemeContext);
}
