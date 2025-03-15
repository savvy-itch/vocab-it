import { create } from "zustand";
import { CombinedStore, Vocab } from "./types";
import { useVocabStore } from "./vocabStore";
import { useWordStore } from "./wordStore";

interface VocabStore {
  vocabs: Vocab[] | [],
  currVocab: Vocab | null,
  setCurrVocab: (vocab: Vocab | null) => void,
  setVocabs: (vocabs: Vocab[]) => void,
  deleteVocab: (id: string) => void,
  editVocabTitle: (id: string, newTitle: string) => void,
}

// const useVocabStore = create<VocabStore>(set => ({
//   vocabs: [],
//   currVocab: null,
//   setCurrVocab: (currVocab: Vocab | null) => set({ currVocab }),
//   setVocabs: (vocabs: Vocab[]) => set({ vocabs }),

//   deleteVocab: (id: string) => {
//     set((state: VocabStore) => {
//       if (state.vocabs) {
//         const filteredVocabs = state.vocabs.filter(vocab => vocab._id !== id);
//         return { vocabs: filteredVocabs };
//       }
//       return state;
//     });
//   },

//   editVocabTitle: (id: string, newTitle: string) => {
//     set((state: VocabStore) => {
//       const vocabToEdit: Vocab | undefined = state.vocabs?.find(v => v._id === id);
//       if (vocabToEdit) {
//         vocabToEdit.title = newTitle;
//       }
//       return { ...state };
//     })
//   },
// }))

// export default useVocabStore;

// export const combinedStore = create<CombinedStore>((set,get) => ({
//   ...useVocabStore(set, get),
//   ...useWordStore(set, get),
// }))
