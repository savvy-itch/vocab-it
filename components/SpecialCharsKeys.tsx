import React, { Dispatch, useState } from 'react';
import { specialSymbols } from '@/lib/globals';
import useVocabStore from '@/lib/store';
import { BsCapslock, BsCapslockFill } from "react-icons/bs";

export default function SpecialCharsKeys({setAnswer}: {setAnswer: Dispatch<React.SetStateAction<string>>}) {
  const currVocab = useVocabStore(state => state.currVocab);
  const [isUpperCase, setIsUpperCase] = useState(false);

  return (
    <section className="flex justify-center gap-2 flex-wrap mt-3">
      {currVocab?.lang !== 'default' && (
        <button
          className="px-3 py-2 bg-gray-300 text-gray-800 rounded-md shadow-md font-mono text-xl font-semibold transition-all duration-100 ease-in-out hover:bg-gray-400"
          onClick={() => setIsUpperCase(!isUpperCase)}
          type="button"
        >
          {isUpperCase ? <BsCapslockFill /> : <BsCapslock />}    
        </button>
      )}
      {currVocab?.lang && currVocab.lang !== 'default' && specialSymbols[currVocab?.lang].map(k => {
        return <button
          key={k}
          className="px-3 py-2 bg-gray-300 text-gray-800 rounded-md shadow-md font-mono text-xl font-semibold transition-all duration-100 ease-in-out hover:bg-gray-400"
          type="button"
          onClick={() => setAnswer((prev: string) => prev + (isUpperCase ? k.toUpperCase() : k))}
        >
          {isUpperCase ? k.toUpperCase() : k}
        </button>
      })}
    </section>
  )
}
