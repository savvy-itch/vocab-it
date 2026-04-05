import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { WordLocal } from "./types";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProgressPercentage(prev: number, trained: number, isCorrect: boolean): number {
  const correctAnswers = Math.round((prev * trained) / 100);
  trained++;
  const updatedCorrectAnswers = correctAnswers + (isCorrect ? 1 : 0);
  const updatedPercentage = Math.floor((updatedCorrectAnswers / trained) * 100);
  return updatedPercentage;
}

/* retrieves a random selection of words */
export function randomizeWords(arr: WordLocal[], vol: number): WordLocal[] {
  let randomizedWords: WordLocal[] = [];
  let sourceArr: WordLocal[] = arr;
  for (let i = 0; i < vol; i++) {
    let randomIdx: number = Math.floor(Math.random() * sourceArr.length);
    randomizedWords.push(sourceArr[randomIdx]);
    sourceArr = sourceArr.filter((_, i) => i !== randomIdx);
  }
  return randomizedWords;
}

/* shuffles given array of ints using Fisher–Yates shuffle */
export function shuffleIndeces(arr: number[]): number[] {
  const shuffledArr = [...arr];
  let i = arr.length - 1;
  
  while(i > 0) {
		const n = Math.floor(Math.random() * (i+1));
    const tmp = shuffledArr[n];
   	shuffledArr[n] = shuffledArr[i];
    shuffledArr[i] = tmp;
    i--;
  }
  
  return shuffledArr;
}

