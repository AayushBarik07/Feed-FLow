import { create } from 'zustand';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  hasCompletedOnboarding: boolean;
  updateTrigger: number;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setHasCompletedOnboarding: (status: boolean) => void;
  triggerUpdate: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'system',
  hasCompletedOnboarding: false,
  updateTrigger: 0,
  setTheme: (theme) => set({ theme }),
  setHasCompletedOnboarding: (status) => set({ hasCompletedOnboarding: status }),
  triggerUpdate: () => set((state) => ({ updateTrigger: state.updateTrigger + 1 })),
}));
