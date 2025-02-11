import { create } from 'zustand';

const useStore = create((set) => ({
  translatedText: '', 
  setTranslatedText: (text) => set({ translatedText: text }), 
}));

export default useStore;
