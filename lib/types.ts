export interface Word {
  _id: string,
  word: string,
  translation: string,
  progress?: number,
  trained: number,
  isGuessCorrect?: boolean
}

export type LangCodes = 'FRA' | 'GER' | 'SPA' | 'default';

export interface Vocab {
  _id: string,
  title: string,
  words: Word[],
  lang?: LangCodes
}

export interface VocabStore {
  vocabs: Vocab[] | null,
  initialFetch: () => void,
  deleteVocab: (id: string) => void,
  addVocab: (title: string) => void,
  editVocabTitle: (id: string, newTitle: string) => void,
}

export interface Answer {
  _id: string,
  word: string,
  translation: string,
  userAnswer: string
}

export type CheckSingleEditFunction = () => boolean;

export interface CustomPayload {
  "UserInfo": {
    "_id": string,
    "username": string,
    "roles": number[]
  },
  "iat": number,
  "exp": number
}

// ========================

/*
Figure out what info should vocab store about the words.
When user adds or deletes a word, a word ID should be added/deleted from the vocab object
*/

export interface VocabLocalStore {
  vocabs: VocabLocal[],
  deleteVocab: (id: string) => void,
  addVocab: (title: string) => void,
  editVocabTitle: (id: string, newTitle: string) => void,
  deleteWordId: (vocabId: string, wordId: string) => void,
  deleteAllWordsId: (vocabId: string) => void,
  addWordId: (vocabId: string, wordId: string) => void,
  setLang: (vocabId: string, lang: LangCodes) => void
}

export interface WordLocalStore {
  words: WordsLocal,
  deleteWord: (wordId: string) => void,
  addWord: (vocabId: string, wordId: string, word: string, translation: string) => void,
  editWord: (wordId: string, newWord: string, newTranslation: string) => void,
  deleteAllVocabWords: (vocabId: string) => void,
  updateProgress: (answers: Answer[]) => void,
  addCsv: (vocabId: string,  words: WordLocal[]) => void
}

export interface VocabLocal {
  _id: string,
  title: string,
  wordIds: string[],
  lang?: LangCodes
}

export interface WordsLocal {
  [key: string]: WordLocal
}

export interface WordLocal {
  _id: string,
  vocabId: string,
  word: string,
  translation: string,
  progress: number,
  trained: number,
  isGuessCorrect?: boolean
}

export type CombinedStore = VocabLocalStore & WordLocalStore;

export interface ImportedWord {
  word: string;
  translation: string;
}

// Operations:
/*
+ add vocab
+ edit vocab title
+ change vocab language
+ delete vocab
+ add word ID
+ delete word ID
+ add CSV imported word IDs

- add word
- edit word
- delete word
- delete all words
- update word progress
- import words
*/

// Data fetching:
/*
- all vocabs titles and the amount of words
- vocab info and all its words
*/
