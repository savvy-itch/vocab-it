import React, { useEffect, useState } from 'react';
import { atma, BASE_URL } from '../lib/globals';
import { useTheme } from 'next-themes';
import { Vocab } from '@/lib/types';
import useVocabStore from '@/lib/store';
import dynamic from 'next/dynamic';

import Image from 'next/image';
import { HiGlobeAlt, HiUserCircle, HiFolder, HiSun, HiMoon, HiPlus } from "react-icons/hi2";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import Link from 'next/link';
import NewVocabDialog from './NewVocabDialog';
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from './ui/skeleton';
import { useAuthStore } from '@/lib/authStore';
import useLogout from '@/hooks/useLogout';
import { useRouter } from 'next/router';
import useAuth from '@/hooks/useAuth';
import useCheckToken from '@/hooks/useCheckToken';

const SoundToggleNoSSR = dynamic(() => import('./SoundToggle'), {
  loading: () => <Skeleton className="w-11 h-11 ml-1 rounded-full" />
});

export default function Navbar() {
  const { vocabs, setVocabs } = useVocabStore(state => state);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [vocabTitle, setVocabTitle] = useState<string>("");
  const [invalidInputMsg, setInvalidInputMsg] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const { setTheme } = useTheme();
  const { accessToken, isTokenChecked, setIsTokenChecked } = useAuthStore(state => state);
  const {checkToken} = useCheckToken();
  const logout = useLogout();
  const router = useRouter();
  const fetchWithAuth = useAuth();

  function resetDialogInput() {
    setVocabTitle('');
    setInvalidInputMsg('');
  }

  async function handleSignOut() {
    router.push('/');
    await logout();
  }

  useEffect(() => {
    if (isDropdownOpen) {
      setIsFetching(true);
      const controller = new AbortController();
      const privateFetch = async () => {
        try {
          const res = await fetchWithAuth(`${BASE_URL}/vocabs/getVocabs`, {
            signal: controller.signal,
            credentials: 'include'
          });
  
          if (!res.ok) {
            throw new Error('Failed to fetch vocabs in navbar');
          }
  
          const data = await res.json();
          setVocabs(data.vocabularies);
        } catch (error) {
          console.error(error);
        }
      }
  
      privateFetch();
  
      return () => {
        controller.abort();
        setIsFetching(false);
      }
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    if (vocabs) {
      setIsFetching(false);
    } else {
      setIsFetching(true);
    }
  }, [vocabs]);

  // check if user is logged in, but hasn't visited any protected routes yet
  useEffect(() => {
    if (!isTokenChecked) {
      setIsFetching(true);
      setIsTokenChecked(false);
      checkToken();
      setIsFetching(false);
    }
  }, []);

  return (
    <nav className="bg-secondary-bg-light dark:bg-secondary-bg-dark py-2 sm:py-5 absolute top-0 left-0 right-0 transition-colors">
      <div className="w-11/12 mobile:w-4/5 mx-auto flex justify-between items-center">
        <Link href={'/'} className="flex items-center" title="Vocab-It - a language learning app">
          <Image
            className="-rotate-12 w-12 h-12 mobile:h-16 mobile:w-16"
            src="/images/vocab-logo.png"
            width={64}
            height={64}
            alt='logo'
          />
          <p className={`${atma.className} text-white text-4xl font-bold hidden sm:inline`}>Vocab-It</p>
        </Link>
        <div>
          <Dialog>
            <Menubar className="bg-transparent dark:bg-transparent border-none" aria-label="menubar">
              {accessToken ? (
                <>
                  <MenubarMenu aria-label="menu">
                    <MenubarTrigger
                      className="p-1 rounded-md active:bg-transparent focus:bg-transparent dark:active:bg-transparent hover:cursor-pointer border-solid border-2 border-transparent hover:border-white transition-colors"
                      aria-label="vocabularies"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <HiGlobeAlt className="w-8 h-8 text-white" />
                    </MenubarTrigger>
                    <MenubarContent className="dark:border-custom-highlight dark:bg-main-bg-dark" align='end'>
                      {isFetching ? (
                        <MenubarItem className="hover:cursor-pointer text-custom-text-light dark:text-white dark:hover:bg-custom-highlight" aria-label="menuitem">
                          <HiFolder className="mr-2" /> LOADING...
                        </MenubarItem>
                      ) : (
                        vocabs?.map((v: Vocab) => {
                          return (
                            <MenubarItem aria-label="menuitem" key={v._id} className="hover:cursor-pointer text-custom-text-light dark:text-white dark:hover:bg-custom-highlight">
                              <Link href={`/vocabularies/${encodeURIComponent(v._id)}`} className="flex items-center w-full">
                                <HiFolder className="mr-2" /> {v.title}
                              </Link>
                            </MenubarItem>)
                        })
                      )}
                      <MenubarSeparator className="dark:bg-custom-highlight" />
                      <MenubarItem aria-label="menuitem" className="hover:cursor-pointer text-custom-text-light dark:text-white dark:hover:bg-custom-highlight">
                        <DialogTrigger className="flex items-center"
                          onClick={resetDialogInput}
                        >
                          <HiPlus className="mr-2" /> New Vocabulary
                        </DialogTrigger>
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>

                  <MenubarMenu>
                    <MenubarTrigger
                      className="p-1 rounded-md active:bg-transparent focus:bg-transparent hover:cursor-pointer border-solid border-2 border-transparent hover:border-white transition-colors"
                      aria-label="account"
                    >
                      <HiUserCircle className="w-8 h-8 fill-white" />
                    </MenubarTrigger>

                    <MenubarContent className="dark:border-custom-highlight dark:bg-main-bg-dark" align='end'>
                      <MenubarItem aria-label="menuitem" className="hover:cursor-pointer text-custom-text-light dark:text-white dark:hover:bg-custom-highlight">
                        <Link className="w-full" href='/profile/'>Account</Link>
                      </MenubarItem>
                      <MenubarItem aria-label="menuitem" className="hover:cursor-pointer text-custom-text-light dark:text-white dark:hover:bg-custom-highlight">
                        <button className="w-full text-left" onClick={handleSignOut}>Sign out</button>
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                </>
              ) : (
                isFetching 
                ? (
                  <>
                    <Skeleton className="w-11 h-11 ml-1 rounded-full" />
                    <Skeleton className="w-11 h-11 ml-1 rounded-full" />
                  </>
                ) : (
                  <>
                    <Link className="hover:cursor-pointer text-white hover:text-white/75 mx-2 text-lg" href="/auth/login">Sign In</Link>
                    <Link className="hover:cursor-pointer text-white hover:text-white/75 mx-2 text-lg" href="/auth/register">Sign Up</Link>
                  </>
                )
              )}

              <MenubarMenu>
                <MenubarTrigger
                  className="p-1 rounded-md active:bg-transparent focus:bg-transparent hover:cursor-pointer border-solid border-2 border-transparent hover:border-white transition-colors"
                  aria-label="color theme"
                >
                  <HiSun className="w-8 h-8 fill-white rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <HiMoon className="w-8 h-8 fill-white absolute rotate-90 scale-0 transition-all dark:-rotate-0 dark:scale-100" />
                </MenubarTrigger>

                <MenubarContent className="dark:border-custom-highlight dark:bg-main-bg-dark" align='end'>
                  <MenubarItem
                    className="hover:cursor-pointer text-custom-text-light dark:text-white dark:hover:bg-custom-highlight"
                    onClick={() => setTheme("light")}
                    aria-label="menuitem"
                  >
                    Light
                  </MenubarItem>
                  <MenubarItem className="hover:cursor-pointer text-custom-text-light dark:text-white dark:hover:bg-custom-highlight"
                    onClick={() => setTheme("dark")}
                    aria-label="menuitem"
                  >
                    Dark
                  </MenubarItem>
                  <MenubarItem className="hover:cursor-pointer text-custom-text-light dark:text-white dark:hover:bg-custom-highlight"
                    onClick={() => setTheme("system")}
                    aria-label="menuitem"
                  >
                    System
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <SoundToggleNoSSR />
            </Menubar>

            <NewVocabDialog
              vocabTitle={vocabTitle}
              setVocabTitle={setVocabTitle}
              invalidInputMsg={invalidInputMsg}
              setInvalidInputMsg={setInvalidInputMsg}
            />
          </Dialog>
        </div>
      </div>
    </nav>
  )
}
