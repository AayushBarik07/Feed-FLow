import { create } from 'zustand';

interface OnboardingState {
  selectedInterests: string[];
  topicsToReduce: string[];
  toggleInterest: (interest: string) => void;
  toggleReduceTopic: (topic: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  selectedInterests: [],
  topicsToReduce: [],
  toggleInterest: (interest) =>
    set((state) => ({
      selectedInterests: state.selectedInterests.includes(interest)
        ? state.selectedInterests.filter((i) => i !== interest)
        : [...state.selectedInterests, interest],
    })),
  toggleReduceTopic: (topic) =>
    set((state) => ({
      topicsToReduce: state.topicsToReduce.includes(topic)
        ? state.topicsToReduce.filter((t) => t !== topic)
        : [...state.topicsToReduce, topic],
    })),
  reset: () => set({ selectedInterests: [], topicsToReduce: [] }),
}));
