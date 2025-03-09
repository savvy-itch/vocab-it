import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { HiTrash } from "react-icons/hi2";
import useVocabStore from '@/lib/store';
import useDisplayPopup from '@/hooks/useDisplayPopup';
import useAuth from '@/hooks/useAuth';
import { BASE_URL } from '@/lib/globals';
import { RxLetterCaseCapitalize } from "react-icons/rx";
import { TbLetterCase } from "react-icons/tb";

export default function DeleteWordsBtn() {
  const {currVocab, setCurrVocab} = useVocabStore(state => state);
  const { displayPopup } = useDisplayPopup();
  const fetchWithAuth = useAuth();

  function deleteVocabFromDb() {
    const controller = new AbortController();
    const privateDelete = async () => {
      try {
        if (!currVocab) {
          displayPopup({isError: true, msg: 'Could not delete words'});
          throw new Error('Could not delete words');
        }

        const res = await fetchWithAuth(`${BASE_URL}/vocabs/deleteWords`, {
          method: 'PATCH',
          signal: controller.signal,
          body: JSON.stringify({ _id: currVocab._id }),
          credentials: 'include'
        });

        if (!res.ok) {
          displayPopup({isError: true, msg: 'Could not delete words'});
          throw new Error('Could not delete words');
        }

        // await refresh();
        const data = await res.json();
        setCurrVocab(data);
      } catch (error) {
        console.error(error);
      }
    }

    privateDelete();
    return () => controller.abort();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger 
        className="flex gap-1 items-center rounded-lg py-2 px-3 font-semibold text-white bg-secondary-bg-light hover:bg-hover-secondary-bg focus:bg-hover-secondary-bg disabled:bg-secondary-bg-light/50 disabled:hover:cursor-not-allowed transition-all hover:scale-105 focus:ring-2 focus:ring-red-400"
        disabled={currVocab?.words.length === 0}
      >
        <TbLetterCase /> Delete <span className="hidden mobile:inline"> All Words</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete all words from this vocabulary?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteVocabFromDb}>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
