import React, { useEffect, useState } from 'react';
import { CheckSingleEditFunction } from '@/lib/types';
import useProfileStore from '@/lib/profileStore';
import { useStore } from 'zustand';
import { usePreferencesStore } from '@/lib/preferencesStore';
import useSound from 'use-sound';
import { BASE_URL, SOUND_VOLUME, errorSound } from '@/lib/globals';
import { Button } from '@/components/ui/button';
import { HiPencilSquare } from "react-icons/hi2";
import useAuth from '@/hooks/useAuth';
import useDisplayPopup from '@/hooks/useDisplayPopup';
import { useAuthStore } from '@/lib/authStore';
import { Skeleton } from './ui/skeleton';

export default function ProfileUsernameSection({ checkSingleEdit }: { checkSingleEdit: CheckSingleEditFunction }) {
  const preferenceStore = useStore(usePreferencesStore, (state) => state);
  const { username, isEditUsername, setUsername, toggleIsEditUsername } = useProfileStore(state => state);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [playError] = useSound(errorSound, { volume: SOUND_VOLUME });
  const fetchWithAuth = useAuth();
  const { displayPopup } = useDisplayPopup();
  const accessToken = useAuthStore(state => state.accessToken);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function updateUsername(e: React.SyntheticEvent) {
    e.preventDefault();
    // if username isn't an empty string and doesn't consist of spaces only
    if (usernameInput.length > 0 && !/^\s*$/.test(usernameInput)) {
      toggleIsEditUsername(); // to false

      const controller = new AbortController();
      const privateUpdate = async () => {
        try {
          const res = await fetchWithAuth(`${BASE_URL}/profile/updateUsername`, {
            method: 'PATCH',
            signal: controller.signal,
            body: JSON.stringify({ username: usernameInput }),
            credentials: 'include'
          });

          if (!res.ok) {
            setUsernameInput(username);
            displayPopup({ isError: true, msg: "Username could not be updated" });
            throw new Error('Failed to update username');
          }

          setUsername(usernameInput);
          displayPopup({ isError: false, msg: "Username has been updated" });
          setErrorMsg('');
        } catch (error) {
          console.error(error);
        }
      }

      privateUpdate();
      return () => controller.abort();
    } else {
      setUsernameInput(username);
      if (preferenceStore.soundOn) playError();
      setErrorMsg('Please enter a valid username');
    }
  }

  function enterEditUsernameMode() {
    const isOnlyEdit: boolean = checkSingleEdit();
    if (isOnlyEdit) {
      toggleIsEditUsername(); // to true
    } else {
      if (preferenceStore.soundOn) playError();
      alert('Please finish editing the other field');
    }
  }

  function checkForAbort(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setUsernameInput(username);
      toggleIsEditUsername();
    }
  }

  useEffect(() => {
    if (accessToken) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [accessToken]);

  if (isLoading) {
    return (
      <div>
        <h2 className='text-xl mobile:text-2xl md:text-3xl font-bold dark:text-custom-text-dark mb-4'>Username</h2>
        <Skeleton className="my-3 w-32 h-[38px] sm:w-2/12" />
        <div className="h-px w-full dark:bg-main-bg-dark mt-3 mb-5" />
      </div>
    )
  }

  return (
    <article>
      <h2 className='text-xl mobile:text-2xl md:text-3xl font-bold dark:text-custom-text-dark mb-4'>Username</h2>
      {isEditUsername ? (
        <>
          <form
            className="flex gap-3 my-3 w-2/12 justify-between items-center"
            onSubmit={updateUsername}
            data-testid="username-form"
          >
            <div>
              <input
                className="text-lg leading-9 px-2 border rounded-sm"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                onKeyDown={checkForAbort}
                size={10}
                maxLength={10}
                autoFocus
                onFocus={() => setErrorMsg('')}
                data-testid="username-input"
              />
            </div>
            <Button
              className="bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600 text-white dark:text-white"
              onSubmit={updateUsername}
              aria-label='submit'
            >
              Save
            </Button>
          </form>
          <p className="text-sm text-red-800 min-h-4">{errorMsg}</p>
        </>
      ) : (
        <div className="flex gap-2 my-3 w-fit sm:w-2/12 justify-between items-center">
          <p className="text-lg leading-[38px] dark:text-custom-text-dark">
            {username}
          </p>
          <button
            className="dark:text-custom-text-dark py-1 text-lg"
            aria-label='edit'
            onClick={enterEditUsernameMode}
          >
            <HiPencilSquare />
          </button>
        </div>
      )}
      <div className="h-px w-full dark:bg-main-bg-dark mt-3 mb-5" />
    </article>
  )
}