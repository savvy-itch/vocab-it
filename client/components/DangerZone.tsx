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
import { BASE_URL, INITIAL_NUMBER } from '@/lib/globals';
import { usePreferencesStore } from '@/lib/preferencesStore';
import { useAuthStore } from '@/lib/authStore';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import useVocabStore from '@/lib/store';
import useDisplayPopup from '@/hooks/useDisplayPopup';

export default function DangerZone() {
  const fetchWithAuth = useAuth();
  const {setAccessToken} = useAuthStore(state => state);
  const {setVocabs} = useVocabStore();
  const {setStoredUsername, updateLessonVolume} = usePreferencesStore();
  const router = useRouter();
  const { displayPopup } = useDisplayPopup();

  async function handleAccountDelete() {
    const controller = new AbortController();
    const privateDelete = async () => {
      try {
        const res = await fetchWithAuth(`${BASE_URL}/profile/deleteAccount`, {
          method: 'DELETE',
          signal: controller.signal,
          credentials: 'include'
        });

        if (!res.ok) {
          displayPopup({ isError: true, msg: "Could not delete account" });
          throw new Error('Failed to delete account');
        }

        // set to default settings
        setAccessToken('');
        setVocabs([]);
        updateLessonVolume(INITIAL_NUMBER);
        setStoredUsername('');
        
        displayPopup({ isError: false, msg: "Your account has been deleted" });
        router.push('/');
      } catch (error) {
        console.error(error);
      }
    }

    privateDelete();

    return () => {
      controller.abort();
    }
  }

  return (
    <section>
      <h2 className='text-xl mobile:text-2xl md:text-3xl font-bold dark:text-custom-text-dark mb-4'>Danger zone</h2>

      <AlertDialog>
        <AlertDialogTrigger className="rounded-full bg-white mobile:bg-secondary-bg-light mobile:hover:bg-secondary-bg-light/80 mobile:text-white cursor-pointer mobile:px-3 mobile:py-1 mobile:rounded-sm" aria-label="delete account">
          <p className="hidden mobile:inline">Delete your account</p>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAccountDelete}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
