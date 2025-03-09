import React, { useEffect, useState } from 'react';
import { CheckSingleEditFunction, Vocab, Word } from '@/lib/types';
import useVocabStore from '@/lib/store';
import useSound from 'use-sound';
import { BASE_URL, SOUND_VOLUME, errorSound } from '@/lib/globals';
import useProfileStore from '@/lib/profileStore';

import { HiPencilSquare, HiTrash, HiCheckCircle, HiMiniXCircle } from "react-icons/hi2";
import { useStore } from 'zustand';
import { usePreferencesStore } from '@/lib/preferencesStore';
import useAuth from '@/hooks/useAuth';
import useRefreshToken from '@/hooks/useRefreshToken';
import useDisplayPopup from '@/hooks/useDisplayPopup';

type SingleWordProps = {
  word: Word,
  vocab: Vocab,
  checkSingleEdit: CheckSingleEditFunction
}

export default function SingleWord({ word, vocab, checkSingleEdit }: SingleWordProps) {
  const [isEditSingleWord, setIsEditSingleWord] = useState<boolean>(false);
  const [newWord, setNewWord] = useState<string>(word.word);
  const [newTranslation, setNewTranslation] = useState<string>(word.translation);
  const setCurrVocab = useVocabStore(state => state.setCurrVocab);
  const { toggleIsEditWord } = useProfileStore(state => state);
  const soundOn = useStore(usePreferencesStore, (state) => state.soundOn);
  const [playError] = useSound(errorSound, { volume: SOUND_VOLUME });
  const fetchWithAuth = useAuth();
  const refresh = useRefreshToken();
  const { displayPopup } = useDisplayPopup();
  const [progressStatus, setProgressStatus] = useState<string>('absent');

  function enterEditWordMode() {
    const isOnlyEdit: boolean = checkSingleEdit();
    if (isOnlyEdit) {
      setIsEditSingleWord(true);
      toggleIsEditWord(); // to true
    } else {
      if (soundOn) playError();
      alert('Please finish editing the other field (SW)');
    }
  }

  function exitEditWordMode() {
    setIsEditSingleWord(false);
    toggleIsEditWord(); // to false
  }

  function checkForAbort(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      exitEditWordMode();
      setNewWord(word.word);
      setNewTranslation(word.translation);
    }
  }

  function submitEdit(e: React.SyntheticEvent) {
    e.preventDefault();

    if (newWord.length === 0 || !/\S/.test(newWord)
      || newTranslation.length === 0 || !/\S/.test(newTranslation)) {
      if (soundOn) playError();
      alert('Enter valid word');
    } else if (vocab.words.some(w => w.word === newWord && w._id !== word._id)) {
      if (soundOn) playError();
      alert('This word already exists in the vocabulary.')
    } else {
      const controller = new AbortController();
      const privateUpdate = async () => {
        try {
          const res = await fetchWithAuth(`${BASE_URL}/vocabs/updateWord`, {
            method: 'PATCH',
            signal: controller.signal,
            body: JSON.stringify({
              vocabId: vocab._id,
              wordId: word._id,
              word: newWord,
              translation: newTranslation
            }),
            credentials: 'include'
          });

          if (!res.ok) {
            displayPopup({ isError: true, msg: "Could not edit the word" });
            throw new Error('Failed to update word');
          }

          await refresh();

          const data = await res.json();
          setIsEditSingleWord(false);
          toggleIsEditWord(); // to false
          setCurrVocab(data);
        } catch (error) {
          console.error(error);
        }
      }

      privateUpdate();
      return () => controller.abort();
    }
    setNewWord(word.word);
    setNewTranslation(word.translation);
  }

  async function deleteWordFromDb() {
    try {
      const controller = new AbortController();
      const privateDelete = async () => {
        const res = await fetchWithAuth(`${BASE_URL}/vocabs/deleteWord`, {
          method: 'PATCH',
          signal: controller.signal,
          body: JSON.stringify({
            vocabId: vocab._id,
            wordId: word._id,
          }),
          credentials: 'include'
        });

        if (!res.ok) {
          displayPopup({ isError: true, msg: "Could not delete the word" });
          throw new Error('Failed to delete word');
        }

        await refresh();

        const data = await res.json();
        setCurrVocab(data);
      }

      privateDelete();
      return () => controller.abort();
    } catch (error) {
      console.error(error);
    }
  }


  useEffect(() => {
    if (word.trained) {
      // check explicitly for the type because while word.progress: 0 is falsy to TS, it's a valid value for the logic
      if (typeof (word.progress) === 'number') {
        if (word.progress < 50) {
          setProgressStatus('poor');
        } else if (word.progress >= 50 && word.progress < 75) {
          setProgressStatus('normal');
        } else if (word.progress >= 75) {
          setProgressStatus('good');
        }
      } else {
        setProgressStatus('absent');
      }
    } else {
      setProgressStatus('absent');
    }
  }, [word]);

  return (
    <article className="text-sm mobile:text-base">
      {isEditSingleWord ? (
        <form
          className="flex justify-between my-1 p-2 rounded-md dark:border-main-bg-dark hover:bg-slate-100 dark:hover:bg-custom-highlight2 focus:bg-slate-100 dark:focus:bg-custom-highlight2 transition-colors"
          onSubmit={submitEdit}
        >
          <input
            className="w-1/3 pl-2 border border-slate-600 rounded-sm"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyDown={checkForAbort}
            size={20}
            autoFocus
          />
          <input
            className="w-1/3 pl-2 border border-slate-600 rounded-sm"
            value={newTranslation}
            onChange={(e) => setNewTranslation(e.target.value)}
            onKeyDown={checkForAbort}
            size={20}
          />
          <button
            className="rounded-full bg-white"
            aria-label="update"
            onClick={submitEdit}
          >
            <HiCheckCircle className="text-btn-bg hover:text-hover-btn-bg focus:text-hover-btn-bg h-8 w-8" />
          </button>
          <button
            className="rounded-full bg-white"
            aria-label="cancel"
            onClick={exitEditWordMode}
          >
            <HiMiniXCircle className="text-secondary-bg-light hover:text-secondary-bg-light/80 focus:text-secondary-bg-light/80 h-8 w-8" />
          </button>
        </form>
      ) : (
        <div className="flex justify-between items-center my-1 p-2 rounded-md dark:border-main-bg-dark hover:bg-slate-100 dark:hover:bg-custom-highlight2 focus:bg-slate-100 dark:focus:bg-custom-highlight2 transition-colors">
          <p className="w-2/5">{word.word}</p>
          <p className="w-1/4 break-words">{word.translation}</p>
          <div
            className={`h-4 w-4 border border-slate-500 dark:border-white rounded-full
            ${progressStatus === 'absent'
                ? 'bg-gray-500'
                : progressStatus === 'poor'
                  ? 'bg-red-500'
                  : progressStatus === 'normal'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
            title={progressStatus}
          />
          <div className="flex gap-1">
            <button className="text-base" aria-label="edit" onClick={enterEditWordMode}><HiPencilSquare /></button>
            <button className="text-base" aria-label="delete" onClick={deleteWordFromDb}><HiTrash /></button>
          </div>
        </div>
      )}
      {/* separator */}
      {vocab.words[vocab.words.length - 1]?.word !== word.word && <div className="h-px w-full dark:bg-main-bg-dark" />}
    </article>
  )
}