import { create } from 'zustand';

interface AppState {
  activeTab: 'chat' | 'knowledge';
  setActiveTab: (tab: 'chat' | 'knowledge') => void;
  activeSessionId: string | undefined ;
  setActiveSessionId: (id: string | undefined) => void;
  inputPrompt: string;
  setInputPrompt: (prompt: string) => void;
  expandedTraces: Record<number, boolean>;
  toggleTrace: (index: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'chat',
  setActiveTab: (tab) => set({ activeTab: tab }),
  activeSessionId: undefined,
  setActiveSessionId: (id) => set({ activeSessionId: id }),
  inputPrompt: '',
  setInputPrompt: (prompt) => set({ inputPrompt: prompt }),
  expandedTraces: {},
  toggleTrace: (index) =>
    set((state) => ({
      expandedTraces: {
        ...state.expandedTraces,
        [index]: !state.expandedTraces[index],
      },
    })),
}));
// Functions like `setActiveTab`, `setActiveSessionId`, `setInputPrompt`, and `toggleTrace` are used to update the state in the store. The `expandedTraces` object keeps track of which traces are expanded, allowing for toggling their state based on their index.