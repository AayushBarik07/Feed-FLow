import { create } from 'zustand';

export type ColorScheme = 'light' | 'dark' | 'system';
export type AccentName = 'ai' | 'technology' | 'finance' | 'travel' | 'fitness' | 'startups' | 'default';

interface ThemeColors {
  background: string;
  card: string;
  border: string;
  primary: string;
  secondary: string;
  text: string;
  textMuted: string;
}

// Light Mode base colors (Premium Off-White / Cream)
const lightBase = {
  background: '#F9FAFB', // Soft off-white
  card: '#FFFFFF', // Clean white
  border: '#E5E7EB', // Light gray tint
  text: '#111827', // Matte black text
  textMuted: '#6B7280', // Slate gray
};

// Dark Mode base colors (Graphite / Matte Black)
const darkBase = {
  background: '#121212', // Matte black
  card: '#1C1C1E', // Charcoal
  border: '#2C2C2E', // Graphite
  text: '#F2F2F7', // Off-white text
  textMuted: '#8E8E93', // Soft gray
};

// Accent colors based on interest
const ACCENTS: Record<AccentName, { primary: string; secondary: string }> = {
  ai: { primary: '#0A84FF', secondary: '#5E5CE6' }, // Deep Blue + Cyan/Purple
  technology: { primary: '#5E5CE6', secondary: '#BF5AF2' }, // Indigo + Purple
  finance: { primary: '#30D158', secondary: '#32ADE6' }, // Emerald + Slate
  travel: { primary: '#FF9F0A', secondary: '#FFD60A' }, // Warm Orange + Sand
  fitness: { primary: '#FF453A', secondary: '#FF375F' }, // Coral + Red
  startups: { primary: '#64D2FF', secondary: '#0A84FF' }, // Electric Blue
  default: { primary: '#0A84FF', secondary: '#8E8E93' }
};

interface ThemeState {
  colorScheme: ColorScheme;
  activeAccent: AccentName;
  isDark: boolean;
  colors: ThemeColors;
  setColorScheme: (scheme: ColorScheme) => void;
  setAccent: (accent: AccentName) => void;
  deriveAccentFromInterest: (dominantInterest: string) => void;
  syncSystemTheme: (systemIsDark: boolean) => void;
}

const computeColors = (isDark: boolean, accent: AccentName): ThemeColors => {
  const base = isDark ? darkBase : lightBase;
  const acc = ACCENTS[accent];
  return { ...base, ...acc };
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  colorScheme: 'system',
  activeAccent: 'default',
  isDark: true, // Default to dark for startup vibe
  colors: computeColors(true, 'default'),

  setColorScheme: (scheme) => {
    // Note: To fully implement 'system', syncSystemTheme must be called by an AppState listener
    const isDark = scheme === 'dark' || (scheme === 'system' && get().isDark);
    set({ colorScheme: scheme, isDark, colors: computeColors(isDark, get().activeAccent) });
  },

  setAccent: (accent) => {
    set({ activeAccent: accent, colors: computeColors(get().isDark, accent) });
  },

  deriveAccentFromInterest: (interest) => {
    const i = interest.toLowerCase();
    let selected: AccentName = 'default';
    
    if (i.includes('ai') || i.includes('machine learning')) selected = 'ai';
    else if (i.includes('tech') || i.includes('coding')) selected = 'technology';
    else if (i.includes('finance') || i.includes('crypto') || i.includes('startup') || i.includes('business')) selected = 'finance';
    else if (i.includes('travel')) selected = 'travel';
    else if (i.includes('fit') || i.includes('health')) selected = 'fitness';
    
    // Explicit startups logic
    if (i.includes('startup')) selected = 'startups';

    set({ activeAccent: selected, colors: computeColors(get().isDark, selected) });
  },

  syncSystemTheme: (systemIsDark) => {
    if (get().colorScheme === 'system') {
      set({ isDark: systemIsDark, colors: computeColors(systemIsDark, get().activeAccent) });
    }
  }
}));
