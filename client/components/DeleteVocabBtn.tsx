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
import useRefreshToken from '@/hooks/useRefreshToken';
import { BASE_URL } from '@/lib/globals';
import { useRouter } from 'next/router';

export default function DeleteVocabBtn() {
  const router = useRouter();
  const {currVocab, deleteVocab} = useVocabStore(state => state);
  const { displayPopup } = useDisplayPopup();
  const fetchWithAuth = useAuth();
  const refresh = useRefreshToken();

  function deleteVocabFromDb() {
    const controller = new AbortController();
    const privateDelete = async () => {
      try {
        if (!currVocab) {
          displayPopup({isError: true, msg: 'Could not delete vocabulary'});
          throw new Error('Could not delete vocabulary');
        }

        const res = await fetchWithAuth(`${BASE_URL}/vocabs/deleteVocab`, {
          method: 'DELETE',
          signal: controller.signal,
          body: JSON.stringify({ _id: currVocab._id }),
          credentials: 'include'
        });

        if (!res.ok) {
          displayPopup({isError: true, msg: 'Could not delete vocabulary'});
          throw new Error('Could not delete vocabulary');
        }

        await refresh();
        deleteVocab(currVocab._id);
        displayPopup({isError: false, msg: 'Vocabulary has been deleted'});
        router.push('/profile');
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
        className="flex gap-1 items-center rounded-lg py-2 px-3 font-semibold text-white bg-secondary-bg-light hover:bg-hover-secondary-bg focus:bg-hover-secondary-bg transition-all hover:scale-105 focus:ring-2 focus:ring-red-400"
        disabled={!currVocab}
      >
        <HiTrash /> Delete <span className="hidden mobile:inline">Vocabulary</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this vocabulary?</AlertDialogTitle>
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
