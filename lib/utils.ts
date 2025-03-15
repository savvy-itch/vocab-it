import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProgressPercentage(prev: number, trained: number, isCorrect: boolean): number {
  let result: number;
  const x = 100/(trained - 1);
  const y = prev / x;
  const z = 100 / trained;

  if (isCorrect) {
    result = trained === 1 ? 100 : Math.floor(z * (y+1));
  } else {
    result = trained === 1 ? 0 : Math.floor(z * y);
  }
  return result;
}
