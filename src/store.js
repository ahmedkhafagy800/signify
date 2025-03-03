import { create } from 'zustand';

const useStore = create((set) => ({
  translatedText: [],
  appendTranslatedText: (text) =>
    set((state) => {
      if (state.translatedText.length > 0 && state.translatedText[state.translatedText.length - 1] === text) {
        return state; 
      }
      return { translatedText: [...state.translatedText, text] };
    }),
  resetTranslatedText: () => set({ translatedText: [] }),
}));

export default useStore;
