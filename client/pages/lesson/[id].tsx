import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Word, Answer } from '@/lib/types';
import { usePreferencesStore } from '@/lib/preferencesStore';
import useSound from 'use-sound';
import { BASE_URL, SOUND_VOLUME, clickSound, specialSymbols } from '@/lib/globals';
import { useAuthStore } from '@/lib/authStore';
import useCheckToken from '@/hooks/useCheckToken';
import useVocabStore from '@/lib/store';
import useAuth from '@/hooks/useAuth';
import Head from 'next/head';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import LessonResult from '@/components/LessonResult';
import HintButton from '@/components/HintButton';
import { NextPageWithLayout } from '../_app';
import Layout from '@/components/Layout';
import EndLessonDialog from '@/components/EndLessonDialog';
import { Progress } from "@/components/ui/progress"
import RequireAuth from '@/components/RequireAuth';
import SpecialCharsKeys from '@/components/SpecialCharsKeys';
import { BsCapslock, BsCapslockFill } from "react-icons/bs";

const initialWordIdx: number = 1;

function randomizeWords(array: Word[], volume: number): Word[] {
  let randomizedWords: Word[] = [];
  let sourceArray: Word[] = array;
  for (let i = 0; i < volume; i++) {
    let randomIdx: number = Math.floor(Math.random() * sourceArray.length);
    randomizedWords.push(sourceArray[randomIdx]);
    sourceArray = sourceArray.filter((_, i) => i !== randomIdx);
  }
  return randomizedWords;
}

const Lesson: NextPageWithLayout = () => {
  const [lessonVolume, setLessonVolume] = useState<number>(0);
  const [currWord, setCurrWord] = useState<number>(initialWordIdx);
  const [words, setWords] = useState<Word[]>([]);
  const [answer, setAnswer] = useState<string>('');
  const [allAnswers, setAllAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpperCase, setIsUpperCase] = useState(false);
  const preferenceStore = usePreferencesStore(state => state);
  const { currVocab, setCurrVocab } = useVocabStore(state => state);
  const router = useRouter();
  const [playClick] = useSound(clickSound, { volume: SOUND_VOLUME });
  const { isTokenChecked, setIsTokenChecked } = useAuthStore(state => state);
  const fetchWithAuth = useAuth();
  const { checkToken } = useCheckToken();
  const inputRef = useRef<HTMLInputElement>(null);

  function submitAnswer(e: React.SyntheticEvent) {
    e.preventDefault();
    registerAnswer();
    if (preferenceStore.soundOn) playClick();
  }

  function registerAnswer() {
    const i = currWord - 1;
    const userAnswer: Answer = {
      _id: words[i]._id,
      word: words[i].word,
      translation: words[i].translation,
      userAnswer: answer.trim()
    };
    setAllAnswers((prevAnswers) => [...prevAnswers, userAnswer]);
    setCurrWord(currWord + 1);
    setAnswer('');
  }

  function restartLesson() {
    setCurrWord(1);
    setAllAnswers([]);
    if (currVocab) {
      setWords(randomizeWords(currVocab.words, lessonVolume));
    }
  }

  function handleSpecialKeyClick(key: string) {
    if (inputRef.current) {
      const cursorPos = inputRef.current.selectionStart ?? 0;
      setAnswer((prev: string) => prev.substring(0, cursorPos) + (isUpperCase ? key.toUpperCase() : key) + prev.substring(cursorPos));
      setIsUpperCase(false);
    }
  }

  // get vocab by default
  useEffect(() => {
    if (router.query.id !== currVocab?._id) {
      console.log('ids are different');
      setIsLoading(true);
      setIsTokenChecked(false);
      const controller = new AbortController();

      const getVocabData = async () => {
        try {
          const res = await fetchWithAuth(`${BASE_URL}/vocabs/getVocab`, {
            method: 'POST',
            signal: controller.signal,
            body: JSON.stringify({ _id: router.query.id }),
            credentials: 'include'
          });

          if (!res.ok) {
            throw new Error('Failed to fetch vocab data');
          }

          const vocab = await res.json();
          setCurrVocab(vocab);
          setWords(vocab.words);
          setIsLoading(false);
        } catch (error) {
          console.error(error);
        }
      }

      checkToken(getVocabData);
      return () => controller.abort();
    }
  }, [router, currVocab]);

  useEffect(() => {
    if (preferenceStore) {
      setLessonVolume(preferenceStore.lessonVolume);
    }
  }, [preferenceStore]);

  useEffect(() => {
    if (currVocab && currVocab.words.length > 0 && lessonVolume > 0) {
      if (lessonVolume > currVocab.words.length) {
        setLessonVolume(currVocab.words.length);
        setWords(randomizeWords(currVocab.words, currVocab.words.length));
      } else {
        setWords(randomizeWords(currVocab.words, lessonVolume));
      }
    }
  }, [lessonVolume, currVocab]);

  // lesson end
  useEffect(() => {
    if (currWord !== initialWordIdx && currWord > lessonVolume) {
      setIsTokenChecked(false);
      const controller = new AbortController();
      const answersToSend = allAnswers.map((a: Answer) => {
        return {
          _id: a._id,
          userAnswer: a.userAnswer
        }
      });

      const updateProgress = async () => {
        try {
          const res = await fetchWithAuth(`${BASE_URL}/vocabs/updateProgress`, {
            method: 'PATCH',
            signal: controller.signal,
            body: JSON.stringify({
              answers: answersToSend,
              vocabId: currVocab?._id
            }),
            credentials: 'include'
          });

          if (!res.ok) {
            throw new Error('Failed to update progress');
          }

          const vocab = await res.json();
          setCurrVocab(vocab);
        } catch (error) {
          console.error(error);
        }
      }

      checkToken(updateProgress);

      return () => controller.abort();
    }
  }, [router, currWord, lessonVolume]);

  useEffect(() => {
    // only fetch data if vocab is different from the last one
    if (router.query.id !== currVocab?._id) {
      setIsLoading(true);
      setCurrVocab(null);
    }
  }, []);

  useEffect(() => {
    if (inputRef.current && isTokenChecked && !isLoading) {
      inputRef.current.focus();
    }
  }, [isLoading, isTokenChecked])

  // end of lesson
  if (currWord > lessonVolume) {
    return (
      <RequireAuth allowedRoles={[1305]}>
        <Head>
          <title>Lesson | Vocab-It</title>
        </Head>
        <div className="w-11/12 lg:w-3/5 mx-auto mb-6">
          <LessonResult allAnswers={allAnswers} words={words} />
          <div className="flex justify-between mt-5 px-3">
            <button
              className="flex gap-1 items-center rounded-lg p-3 mobile:px-4 text-sm mobile:text-base font-semibold text-white bg-zinc-600 hover:bg-zinc-500 focus:bg-zinc-500 transition-colors"
              onClick={restartLesson}
            >
              Start Again
            </button>
            <button className="flex gap-1 items-center rounded-lg p-3 mobile:px-4 text-sm mobile:text-base font-semibold text-white bg-zinc-600 hover:bg-zinc-500 focus:bg-zinc-500 transition-colors">
              <Link href="/profile">
                Back to Profile
              </Link>
            </button>
          </div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth allowedRoles={[1305]}>
      <Head>
        <title>Lesson | Vocab-It</title>
      </Head>
      <div className="w-11/12 lg:w-3/5 mx-auto mb-6">
        <p className="mx-3">{currWord}/{lessonVolume}</p>
        <Progress
          className="my-3"
          value={Math.round(((currWord - 1) / lessonVolume) * 100)}
          aria-label="progress bar"
        />
        <section className="w-full p-4 sm:p-8 rounded-xl bg-white text-custom-text-light dark:text-custom-text-dark dark:bg-custom-highlight border border-zinc-400 dark:border-zinc-300 shadow-2xl">
          <div>
            <h2 className="text-xl mobile:text-2xl">Word:</h2>
            {(isTokenChecked && !isLoading && words[currWord - 1]) ? (
              <p className="text-2xl mobile:text-3xl text-center my-3">
                {words[currWord - 1].translation}
              </p>
            ) : (
              <div className="w-full flex justify-center my-3">
                <Skeleton className="h-8 mobile:h-9 w-1/4" />
              </div>
            )}
          </div>
          <div className="h-px my-5 w-full bg-zinc-400 dark:bg-main-bg-dark" />
          <div>
            <div className="flex justify-between">
              <h2 className="text-xl mobile:text-2xl">Enter translation:</h2>
              {(isTokenChecked && !isLoading && words[currWord - 1]) ? (
                <HintButton word={words[currWord - 1].word} />
              ) : (
                <Skeleton className="w-[38px] h-[38px] rounded-sm" />
              )}
            </div>
            <form className="my-3 flex justify-center" onSubmit={submitAnswer}>
              <input
                ref={inputRef}
                className="text-2xl leading-10 text-center rounded-sm border border-zinc-400 w-full mobile:w-auto"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Your answer"
                autoFocus
                spellCheck="false"
                disabled={!isTokenChecked || isLoading}
              />
            </form>
          </div>
        </section>
        {(isTokenChecked && !isLoading && words[currWord - 1]) && (
          <>
            <div className="flex justify-between mt-5 px-3">
              <EndLessonDialog />
              <button
                className="w-16 text-sm mobile:text-base mobile:w-28 flex justify-center items-center rounded-lg py-2 font-semibold text-white bg-zinc-600 hover:bg-zinc-500 focus:bg-zinc-500 transition-colors disabled:text-gray-400"
                onClick={registerAnswer}
                disabled={!isTokenChecked || isLoading}
              >
                Skip
              </button>
              <button
                className="w-16 text-sm mobile:text-base mobile:w-28 flex justify-center items-center rounded-lg py-2 font-semibold text-white bg-btn-bg hover:bg-hover-btn-bg focus:bg-hover-btn-bg transition-colors disabled:text-gray-400"
                onClick={registerAnswer}
                disabled={!isTokenChecked || isLoading}
              >
                OK
              </button>
            </div>
            {currVocab?.lang && Object.getOwnPropertyNames(specialSymbols).includes(currVocab.lang) && (
              <section className="flex justify-center gap-2 flex-wrap mt-3">
                {currVocab?.lang !== 'default' && (
                  <button
                    className="px-3 py-2 bg-gray-300 text-custom-text-light rounded-md shadow-md font-mono text-xl font-semibold transition-all duration-100 ease-in-out hover:bg-gray-400"
                    onClick={() => setIsUpperCase(!isUpperCase)}
                    type="button"
                  >
                    {isUpperCase ? <BsCapslockFill /> : <BsCapslock />}
                  </button>
                )}
                {currVocab?.lang && currVocab.lang !== 'default' && specialSymbols[currVocab?.lang].map(k => {
                  return <button
                    key={k}
                    className="px-3 py-2 bg-gray-300 text-custom-text-light rounded-md shadow-md font-mono text-xl font-semibold transition-all duration-100 ease-in-out hover:bg-gray-400"
                    type="button"
                    onClick={() => handleSpecialKeyClick(k)}
                  >
                    {isUpperCase ? k.toUpperCase() : k}
                  </button>
                })}
              </section>
            )}
          </>
        )}
      </div>
    </RequireAuth>
  )
}

Lesson.getLayout = function getLayout(page: ReactElement) {
  return (<Layout>{page}</Layout>)
}

export default Lesson;