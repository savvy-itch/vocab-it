import React, { useRef, useState } from 'react';
import useVocabStore from '@/lib/store';
import { useStore } from 'zustand';
import { usePreferencesStore } from '@/lib/preferencesStore';
import { BASE_URL, SOUND_VOLUME, errorSound, successSound } from '@/lib/globals';
import useSound from 'use-sound';
import { Label } from './ui/label';
import { HiDocumentText } from "react-icons/hi2";
import useAuth from '@/hooks/useAuth';
import useRefreshToken from '@/hooks/useRefreshToken';
import useDisplayPopup from '@/hooks/useDisplayPopup';

interface ImportWords {
  word: string;
  translation: string;
}

export default function FileForm() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { currVocab, setCurrVocab } = useVocabStore(state => state);
  const soundOn = useStore(usePreferencesStore, (state) => state.soundOn);
  const [playError] = useSound(errorSound, { volume: SOUND_VOLUME });
  const [filePreview, setFilePreview] = useState<string>('No file selected');
  const [isSelectFile, setIsSelectFile] = useState<boolean>(false);
  const fetchWithAuth = useAuth();
  const refresh = useRefreshToken();
  const { displayPopup } = useDisplayPopup();

  function displayFileInfo(e: React.SyntheticEvent) {
    e.preventDefault();
    
    if (inputRef.current) {
      const files = inputRef.current.files;
      if (files && files.length > 0) {
        const file = files[0];
        // if the file type isn't .txt or .csv
        if (file.type !== 'text/plain' && file.type !== 'text/csv') {
          if (soundOn) playError();
          alert('Please choose .txt/.csv file');
          return;
        }
        const reader = new FileReader();
        
        reader.onload = (event) => {
          if (event.target) {
            const words = [];
            const fileContent = event.target.result as string;
      
            if (fileContent.length === 0) return;

            let startIdx = 0;

            for (let i = 1; i < fileContent.length; i++) {
              // if it's a separator
              if (fileContent[i] === ';' || fileContent[i] === ',') {
                // if a word was provided without translation
                if (fileContent[i+1] === "\r" && fileContent[i+2] === "\n") {
                  // move to the next line
                  startIdx = i+3;
                  i += 2;
                } else {
                  // if it's a valid word
                  let wordStr = fileContent.substring(startIdx, i);
                  const wordObj = {word: wordStr, translation: ''};
                  words.push(wordObj);
                  // if file uses incorrect indentation (', ')
                  (fileContent[i+1] === ' ') ? startIdx = i+2 : startIdx = i+1;
                }
              } else if (fileContent[i] === "\n") {
                // if it's the end of the line
                let translationStr = fileContent.substring(startIdx, i-1);
                // if no valid translation, remove last word object
                words[words.length - 1].translation = translationStr;
                startIdx = i+1;
              } else if (i === fileContent.length - 1) {
                let translationStr = fileContent.substring(startIdx, i+1);
                words[words.length - 1].translation = translationStr;
              }
            }
            checkForDuplicateWords(words);
          }
        }
        reader.readAsText(file);
      }
    }
  }

  function checkForDuplicateWords(words: ImportWords[]) {
    const wordSet = new Set();
    const uniqueWords: ImportWords[] = [];
    for (const word of words) {
      // if there's no duplicates in the file and in the store
      if (!wordSet.has(word.word) && !currVocab?.words.some(w => w.word === word.word)) {
        wordSet.add(word.word);
        uniqueWords.push(word);
      }
    }
    // setImportedWords(uniqueWords);
    if (uniqueWords.length > 0) {
      const controller = new AbortController();
      const privateUpdate = async () => {
        try {
          const res = await fetchWithAuth(`${BASE_URL}/vocabs/importCsv`, {
            method: 'POST',
            signal: controller.signal,
            body: JSON.stringify({
              vocabId: currVocab?._id,
              words: uniqueWords
            }),
            credentials: 'include'
          });

          if (!res.ok) {
            displayPopup({ isError: true, msg: "Could not edit the word" });
            throw new Error('Failed to update word');
          }

          await refresh();

          const data = await res.json();
          setCurrVocab(data);
          displayPopup({ isError: false, msg: "Words from file have been imported" });
        } catch (error) {
          console.error(error);
        }
      }

      privateUpdate();
      return () => controller.abort();
    } 
  }

  function displayFileName() {
    if (inputRef.current) {
      const files = inputRef.current.files;
      if (files && files.length > 0) {
        setFilePreview(files[0].name);
        setIsSelectFile(true);
      }
    }
  }

  return (
    <form 
      className="w-full mobile:w-3/4 xl:w-1/2 flex flex-col justify-center items-center font-sans px-1 py-2 rounded-md border-2 border-zinc-400 dark:border-zinc-300"
      onSubmit={displayFileInfo}
    >
      <p className="text-lg mt-1">Import a <span className="font-mono font-semibold">.txt/.csv</span> file</p>
      <p className="mb-3">(in the form &#34;word,translation&#34;)</p>
      <Label
        className="w-full mobile:w-2/3 text-center text-base text-white p-2 rounded-sm bg-zinc-700 hover:bg-zinc-800 hover:cursor-pointer transition-colors" 
        htmlFor="words-file"
      >
        Choose file
      </Label>
      <input 
        className="opacity-0 h-0"
        ref={inputRef}
        id="words-file" 
        name="words file" 
        type="file"
        accept=".txt, .csv"
        onChange={displayFileName}
      />
      <p className="my-3 italic flex justify-center items-center gap-1 w-80 max-w-[90%] overflow-hidden">{isSelectFile && <HiDocumentText />} {filePreview}</p>
      <button 
        className="w-full mobile:w-auto text-center text-base text-white font-semibold py-2 px-5 rounded-sm bg-zinc-700 hover:bg-zinc-800 hover:cursor-pointer disabled:cursor-default disabled:bg-zinc-600 disabled:text-zinc-300 transition-colors"
        type="submit" 
        onSubmit={displayFileInfo}
        disabled={!isSelectFile}
      >
        Submit
      </button>
    </form>
  )
}