import Layout from '@/components/Layout'
import Head from 'next/head'
import React, { ReactElement, useEffect, useState } from 'react'
import { NextPageWithLayout } from '../../_app'
import { Progress } from '@/components/ui/progress'
import EndLessonDialog from '@/components/EndLessonDialog'
import { usePreferencesStore } from '@/lib/preferencesStore'
import { useVocabStore } from '@/lib/vocabStore'
import { VocabLocal, WordLocal } from '@/lib/types'
import { useRouter } from 'next/router'
import { useWordStore } from '@/lib/wordStore'
import { randomizeWords, shuffleIndeces } from '@/lib/utils'

type PressedBtns = {
  word: string | null,
  translation: string | null
}

const wordsPerCard = 5;
const defRounds = 5;

const PairsLesson: NextPageWithLayout = () => {
  const [lessonVolume, setLessonVolume] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [curVocab, setCurVocab] = useState<VocabLocal>();
  const [allCurVocabWords, setAllCurVocabWords] = useState<WordLocal[]>([]);
  const [lessonWords, setLessonWords] = useState<WordLocal[]>([]);
  const [curCardCount, setCurCardCount] = useState<number>(0);
  const [curCardWordIdxs, setCurCardWordIdxs] = useState<number[]>([]);
  const [curCardTranslationIdxs, setCurCardTranslationIdxs] = useState<number[]>([]);
  const [pressedBtns, setPressedBtns] = useState<PressedBtns>({ word: null, translation: null });
  const [hiddenPairs, setHiddenPairs] = useState<Set<string>>(new Set());

  const { vocabs } = useVocabStore(state => state);
  const preferenceStore = usePreferencesStore(state => state);
  const { words } = useWordStore(state => state);

  const router = useRouter();

  function getVocabWords() {
    setIsLoading(true);
    if (router.query.id) {
      const existingVocab = vocabs.find(v => v._id === router.query.id);
      if (existingVocab) {
        setCurVocab(existingVocab);
        const vocabStorageWords: WordLocal[] = [];
        existingVocab.wordIds.map(wordId => {
          if (words[wordId]) {
            vocabStorageWords.push(words[wordId]);
          }
        });
        setAllCurVocabWords(vocabStorageWords);
      } else {
        alert("Vocabulary doesn't exist");
      }
    }
    setIsLoading(false);
  }

  function handleBtnClick(id: string, isTranslation: boolean) {
    if (isTranslation) {
      // correct guess
      if (pressedBtns?.word === id) {
        setHiddenPairs(prev => new Set(prev).add(id));
        setPressedBtns({ word: null, translation: null });
      } 
      // no translation btn has been pressed before
      else if (pressedBtns && !pressedBtns.translation) {
        setPressedBtns({ ...pressedBtns, translation: id});
      }
      // translation btn has already been pressed
      else if (pressedBtns?.translation) {
        // discard the previous presses
        setPressedBtns({ word: null, translation: null });
      }
    } else {
      // correct guess
      if (pressedBtns.translation === id) {
        setHiddenPairs(prev => new Set(prev).add(id));
        setPressedBtns({ word: null, translation: null });
      }
      // no word btn has been pressed before
      else if (pressedBtns && !pressedBtns.word) {
        console.log("no word btn has been pressed before");
        setPressedBtns({ ...pressedBtns, word: id });
      } 
      // word btn has already been pressed
      else if (pressedBtns?.word) {
        // discard the previous presses
        setPressedBtns({ word: null, translation: null });
      }

      // add condition for incorrect guess
    }
  }

  // get all vocab words by default
  useEffect(() => {
    getVocabWords();
  }, [router]);

  useEffect(() => {
    if (preferenceStore) {
      setLessonVolume(preferenceStore.lessonVolume);
    }
  }, [preferenceStore]);

  useEffect(() => {
    if (curVocab && curVocab.wordIds.length > 0 && lessonVolume > 0) {
      const wordsForLesson: WordLocal[] = randomizeWords(allCurVocabWords, lessonVolume);
      if (lessonVolume > curVocab.wordIds.length) {
        setLessonVolume(curVocab.wordIds.length);
        setLessonWords(randomizeWords(wordsForLesson, curVocab.wordIds.length));
      } else {
        setLessonWords(randomizeWords(wordsForLesson, lessonVolume));
      }
      setIsLoading(false);
    }
  }, [lessonVolume, router, allCurVocabWords]);

  useEffect(() => {
    if (lessonWords.length > 0) {
      const arr: number[] = [];
      let start = curCardCount * wordsPerCard;
      const end = start + wordsPerCard;
      for (let i = start; i < end; i++) {
        arr.push(i);
      }
      setCurCardWordIdxs(arr);
      setCurCardTranslationIdxs(shuffleIndeces(arr));
    }
  }, [curCardCount, lessonWords]);

  return (
    <>
      <Head>
        <title>Find a Pair | Vocab-It</title>
      </Head>
      <div className="w-11/12 lg:w-3/5 mx-auto mb-6">
        <p className="mx-3">{curCardCount+1}/{defRounds}</p>
        <Progress
          className="my-3"
          value={0}
          aria-label="progress bar"
        />
        <section className="w-full p-4 sm:p-8 rounded-xl bg-white text-custom-text-light dark:text-custom-text-dark dark:bg-custom-highlight border border-zinc-400 dark:border-zinc-300 shadow-2xl">
          <h1 className="text-center text-xl mb-5">Find a pair</h1>
          <div className="flex justify-between">
            <div className="flex flex-col gap-3 w-2/5">
              {!isLoading && curCardWordIdxs?.map(idx => (
                <button 
                  key={`w-${lessonWords[idx]._id}`}
                  onClick={() => handleBtnClick(lessonWords[idx]._id, false)} 
                  className={`${hiddenPairs.has(lessonWords[idx]._id) ? "opacity-0 transition-opacity" : "text-center rounded-lg text-white bg-btn-bg hover:bg-hover-btn-bg hover:cursor-pointer focus:bg-hover-btn-bg disabled:bg-btn-bg/40 border-zinc-400 transition-colors"} p-3 mobile:px-4 text-sm mobile:text-base font-semibold border transition`}
                  disabled={Boolean(pressedBtns.word && pressedBtns?.word !== lessonWords[idx]._id)}
                >
                  {lessonWords[idx].word}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3 w-2/5">
              {!isLoading && curCardTranslationIdxs?.map(idx => (
                <button 
                  key={`t-${lessonWords[idx]._id}`}
                  onClick={() => handleBtnClick(lessonWords[idx]._id, true)}
                  className={`${hiddenPairs.has(lessonWords[idx]._id) ? "opacity-0 transition-opacity" : "text-center rounded-lg text-white bg-rose-800 hover:bg-rose-900 hover:cursor-pointer focus:bg-rose-900 disabled:bg-rose-800/40 border-zinc-400 transition-colors"} p-3 mobile:px-4 text-sm mobile:text-base font-semibold border`}
                  disabled={Boolean(pressedBtns.translation && pressedBtns?.translation !== lessonWords[idx]._id)}
                >
                  {lessonWords[idx].translation}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="flex justify-center mt-5 px-3">
          <EndLessonDialog />
        </div>
      </div>
    </>
  )
}

PairsLesson.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>
}

export default PairsLesson;
