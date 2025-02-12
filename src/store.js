import { create } from 'zustand';

const useStore = create((set) => ({
  translatedText: [],
  appendTranslatedText: (text) =>
    set((state) => ({ translatedText: [...state.translatedText, text] })),
  resetTranslatedText: () => set({ translatedText: [] }),
}));

export default useStore;
