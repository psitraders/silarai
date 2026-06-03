import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeId = 'teal' | 'purple' | 'blue' | 'rose' | 'orange';

export interface Theme {
  id: ThemeId;
  name: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryBg: string;
  primaryText: string;
}

export const THEMES: Theme[] = [
  {
    id: 'teal',
    name: 'Teal',
    primary: '#0d9488',
    primaryDark: '#0f766e',
    primaryLight: '#14b8a6',
    primaryBg: '#f0fdfa',
    primaryText: '#0f766e',
  },
  {
    id: 'purple',
    name: 'Purple',
    primary: '#9333ea',
    primaryDark: '#7e22ce',
    primaryLight: '#a855f7',
    primaryBg: '#faf5ff',
    primaryText: '#7e22ce',
  },
  {
    id: 'blue',
    name: 'Blue',
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    primaryLight: '#3b82f6',
    primaryBg: '#eff6ff',
    primaryText: '#1d4ed8',
  },
  {
    id: 'rose',
    name: 'Rose',
    primary: '#e11d48',
    primaryDark: '#be123c',
    primaryLight: '#f43f5e',
    primaryBg: '#fff1f2',
    primaryText: '#be123c',
  },
  {
    id: 'orange',
    name: 'Orange',
    primary: '#ea580c',
    primaryDark: '#c2410c',
    primaryLight: '#f97316',
    primaryBg: '#fff7ed',
    primaryText: '#c2410c',
  },
];

interface ThemeState {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  currentTheme: () => Theme;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeId: 'teal',
      setTheme: (id: ThemeId) => {
        set({ themeId: id });
        applyTheme(THEMES.find(t => t.id === id)!);
      },
      currentTheme: () => THEMES.find(t => t.id === get().themeId) ?? THEMES[0],
    }),
    { name: 'Silarai-theme' }
  )
);

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.style.setProperty('--rc-primary', theme.primary);
  root.style.setProperty('--rc-primary-dark', theme.primaryDark);
  root.style.setProperty('--rc-primary-light', theme.primaryLight);
  root.style.setProperty('--rc-primary-bg', theme.primaryBg);
  root.style.setProperty('--rc-primary-text', theme.primaryText);
  root.setAttribute('data-theme', theme.id);
}

