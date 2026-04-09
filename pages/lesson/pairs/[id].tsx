import Layout from '@/components/Layout'
import Head from 'next/head'
import { ReactElement, useEffect, useState } from 'react'
import { NextPageWithLayout } from '../../_app'
import { Progress } from '@/components/ui/progress'
import EndLessonDialog from '@/components/EndLessonDialog'
import { usePreferencesStore } from '@/lib/preferencesStore'
import { useVocabStore } from '@/lib/vocabStore'
import { Answer, VocabLocal, WordLocal } from '@/lib/types'
import { useRouter } from 'next/router'
import { useWordStore } from '@/lib/wordStore'
import { randomizeWords, shuffleIndeces } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

type PressedBtns = {
  word: string | null,
  translation: string | null
}

const defWordsPerCard = 5;
const defRounds = 5;

const PairsLesson: NextPageWithLayout = () => {
  const [lessonVolume, setLessonVolume] = useState<number>(defWordsPerCard * defRounds);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [curVocab, setCurVocab] = useState<VocabLocal>();
  const [allVocabWords, setAllVocabWords] = useState<WordLocal[]>([]);
  const [lessonWords, setLessonWords] = useState<WordLocal[]>([]);
  const [curCardCount, setCurCardCount] = useState<number>(0);
  const [curCardWordIdxs, setCurCardWordIdxs] = useState<number[]>([]);
  const [curCardTranslationIdxs, setCurCardTranslationIdxs] = useState<number[]>([]);
  const [pressedBtns, setPressedBtns] = useState<PressedBtns>({ word: null, translation: null });
  const [hiddenPairs, setHiddenPairs] = useState<Set<string>>(new Set());
  const [rounds, setRounds] = useState<number>(defRounds);
  const [wordsPerCard, setWordsPerCard] = useState<number>(defWordsPerCard);
  const [allAnswers, setAllAnswers] = useState<Answer[]>([]);

  const { vocabs } = useVocabStore(state => state);
  const { words, updateProgress } = useWordStore(state => state);

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
        setAllVocabWords(vocabStorageWords);
      } else {
        alert("Vocabulary doesn't exist");
      }
    }
  }

  function handleBtnClick(id: string, word: string, translation: string, isTranslation: boolean) {
    if (isTranslation) {
      if (!pressedBtns.word) {
        // pressing the same button again
        if (pressedBtns.translation === id) {
          setPressedBtns({ word: null, translation: null });
        } else {
          // first word btn press
          setPressedBtns({ ...pressedBtns, translation: id});
        }
      } else if (pressedBtns?.word === id) {
        // correct guess
        setHiddenPairs(prev => new Set(prev).add(id));
        console.log({ line: 75, id, word, translation, userAnswer: word });
        registerAnswer(id, word, translation, word);
        setPressedBtns({ word: null, translation: null });
      } else {
        // wrong guess
        if (pressedBtns.word) {
          const w = lessonWords.find(w => w._id === pressedBtns.word);
          console.log({ line: 82, id: pressedBtns.word, word: w?.word, translation: w?.translation, userAnswer: w?.word });
          w && registerAnswer(pressedBtns.word, w.word, w.translation, w.word);
        }
        setPressedBtns({ word: null, translation: null });
      }
    } else {
      if (!pressedBtns.translation) {
        // pressing the same button again
        if (pressedBtns.word === id) {
          setPressedBtns({ word: null, translation: null });
        } else {
          // first word btn press
          setPressedBtns({ ...pressedBtns, word: id});
        }
      } else if (pressedBtns?.translation === id) {
        // correct guess
        setHiddenPairs(prev => new Set(prev).add(id));
        console.log({ line: 99, id, word, translation, userAnswer: word });
        registerAnswer(id, word, translation, word);
        setPressedBtns({ word: null, translation: null });
      } else {
        // wrong guess
        if (pressedBtns.translation) {
          const w = lessonWords.find(w => w._id === pressedBtns.translation);
          console.log({ line: 107, id: pressedBtns.translation, word: w?.word, translation: w?.translation, userAnswer: w?.word });
          w && registerAnswer(pressedBtns.translation, w.word, w.translation, w.word);
        }
        setPressedBtns({ word: null, translation: null });
      }
    }
  }

  function registerAnswer(id: string, word: string, translation: string, userAnswer: string) {
    const answer: Answer = {
      _id: id,
      word,
      translation,
      userAnswer
    };
    setAllAnswers(prev => [...prev, answer]);
  }

  // get all vocab words by default
  useEffect(() => {
    if (router.isReady) {
      getVocabWords();
    }
  }, [router.isReady]);

  useEffect(() => {
    if (curVocab && curVocab.wordIds.length > 0) {
      const vol = rounds * wordsPerCard;
      const wordsTotal = curVocab.wordIds.length;
      const trueVol = Math.min(vol, wordsTotal);
      setLessonVolume(trueVol);
      setLessonWords(randomizeWords(allVocabWords, trueVol));

      const trueRounds = Math.ceil(trueVol / wordsPerCard);
      if (trueRounds < rounds) {
        setRounds(trueRounds);
      }
    }
  }, [lessonVolume, allVocabWords, wordsPerCard, rounds, curVocab]);

  useEffect(() => {
    if (lessonWords.length > 0) {
      const arr: number[] = [];
      const remainingWordsPerCard = lessonVolume - (curCardCount * wordsPerCard);
      let start, end;
      if (remainingWordsPerCard < wordsPerCard) {
        setWordsPerCard(remainingWordsPerCard);
        start = curCardCount * remainingWordsPerCard;
        end = start + remainingWordsPerCard;
      } else {
        start = curCardCount * wordsPerCard;
        end = start + wordsPerCard;
      }
      for (let i = start; i < end; i++) {
        arr.push(i);
      }
      setCurCardWordIdxs(arr);
      setCurCardTranslationIdxs(shuffleIndeces(arr));
      setIsLoading(false);
    }
  }, [curCardCount, lessonWords, lessonVolume, wordsPerCard]);

  useEffect(() => {
    // end of lesson
    if ((curCardCount + 1) === rounds && hiddenPairs.size === wordsPerCard) {
      updateProgress(allAnswers);
      router.push(`/vocabularies/${router.query.id}`);
    } else if (hiddenPairs.size === wordsPerCard) {
    // next card 
      setCurCardCount(prev => prev + 1);
      setHiddenPairs(new Set());
      setPressedBtns({ word: null, translation: null });
    }
  }, [hiddenPairs]);

  return (
    <>
      <Head>
        <title>Find a Pair | Vocab-It</title>
      </Head>
      <div className="w-11/12 lg:w-3/5 mx-auto mb-6">
        <p className="mx-3">{curCardCount+1}/{rounds}</p>
        <Progress
          className="my-3"
          value={curCardCount/rounds * 100}
          aria-label="progress bar"
        />
        <section className="w-full p-4 sm:p-8 rounded-xl bg-white text-custom-text-light dark:text-custom-text-dark dark:bg-custom-highlight border border-zinc-400 dark:border-zinc-300 shadow-2xl">
          <h1 className="text-center text-xl mb-5">Find a pair</h1>
          <div className="flex justify-between">
            <div className="flex flex-col gap-3 w-2/5">
              {isLoading ? (
                <>
                  <Skeleton className="h-12.5 w-full" />
                  <Skeleton className="h-12.5 w-full" />
                  <Skeleton className="h-12.5 w-full" />
                  <Skeleton className="h-12.5 w-full" />
                  <Skeleton className="h-12.5 w-full" />
                </>
              ) : (
                curCardWordIdxs?.map(idx => (
                  <button 
                    key={`w-${lessonWords[idx]._id}`}
                    onClick={() => handleBtnClick(lessonWords[idx]._id, lessonWords[idx].word, lessonWords[idx].translation, false)} 
                    className={`${hiddenPairs.has(lessonWords[idx]._id) ? "opacity-0 transition-opacity" : "text-center rounded-lg text-white bg-btn-bg hover:bg-hover-btn-bg hover:cursor-pointer focus:bg-hover-btn-bg disabled:bg-btn-bg/40 border-zinc-400 transition-colors"} p-3 mobile:px-4 text-sm mobile:text-base font-semibold border transition`}
                    disabled={Boolean(pressedBtns.word && pressedBtns?.word !== lessonWords[idx]._id)}
                  >
                    {lessonWords[idx].word}
                  </button>
                ))
              )}
            </div>
            <div className="flex flex-col gap-3 w-2/5">
              {isLoading ? (
                <>
                  <Skeleton className="h-12.5 w-full" />
                  <Skeleton className="h-12.5 w-full" />
                  <Skeleton className="h-12.5 w-full" />
                  <Skeleton className="h-12.5 w-full" />
                  <Skeleton className="h-12.5 w-full" />
                </>
              ) : (
                curCardTranslationIdxs?.map(idx => (
                  <button 
                    key={`t-${lessonWords[idx]._id}`}
                    onClick={() => handleBtnClick(lessonWords[idx]._id, lessonWords[idx].word, lessonWords[idx].translation, true)}
                    className={`${hiddenPairs.has(lessonWords[idx]._id) ? "opacity-0 transition-opacity" : "text-center rounded-lg text-white bg-rose-800 hover:bg-rose-900 hover:cursor-pointer focus:bg-rose-900 disabled:bg-rose-800/40 border-zinc-400 transition-colors"} p-3 mobile:px-4 text-sm mobile:text-base font-semibold border`}
                    disabled={Boolean(pressedBtns.translation && pressedBtns?.translation !== lessonWords[idx]._id)}
                  >
                    {lessonWords[idx].translation}
                  </button>
                ))
              )}
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
