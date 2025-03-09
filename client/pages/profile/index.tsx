import React, { ReactElement, useEffect } from 'react';
import { NextPageWithLayout } from '../_app';
import Head from "next/head";
import Layout from '@/components/Layout';
import Footer from '@/components/Footer';
import useProfileStore from '@/lib/profileStore';
import ProfileAddVocabSection from '@/components/ProfileAddVocabSection';
import ProfileWordSection from '@/components/ProfileWordSection';
import { Toaster } from '@/components/ui/toaster';
import RequireAuth from '@/components/RequireAuth';
import useAuth from '@/hooks/useAuth';
import { BASE_URL } from '@/lib/globals';
import useVocabStore from '@/lib/store';
import DangerZone from '@/components/DangerZone';
import { useAuthStore } from '@/lib/authStore';
import useCheckToken from '@/hooks/useCheckToken';
import ProfileUsernameSection from '@/components/ProfileUsernameSection';

const Profile: NextPageWithLayout = () => {
  const {
    isEditUsername,
    isEditWordAmount,
    isAddVocab,
    isEditVocabTitle,
    setUsername,
    toggleIsEditUsername,
    toggleIsEditWordAmount,
    toggleIsAddVocab,
    toggleIsEditVocabTitle
  } = useProfileStore(state => state);
  const setVocabs = useVocabStore(state => state.setVocabs);
  const fetchWithAuth = useAuth();
  const { accessToken, setIsTokenChecked } = useAuthStore(state => state);
  const {checkToken} = useCheckToken();

  // only allow one field editing at a time
  function checkSingleEdit() {
    if (isEditUsername || isEditWordAmount || isAddVocab || isEditVocabTitle) {
      return false;
    }
    return true;
  }

  useEffect(() => {
    setIsTokenChecked(false);
    const controller = new AbortController();

    const getProfileData = async () => {
      try {
        const res = await fetchWithAuth(`${BASE_URL}/profile`, {
          signal: controller.signal
        });

        if (!res.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await res.json();
        setVocabs(data.vocabularies);
        setUsername(data.username);
      } catch (error) {
        console.error(error);
      }
    }

    checkToken(getProfileData);

    return () => {
      controller.abort();
    }
  }, [accessToken]);

  useEffect(() => {
    // reset all active edit modes 
    switch (true) {
      case isEditUsername:
        toggleIsEditUsername();
      case isEditWordAmount:
        toggleIsEditWordAmount();
      case isAddVocab:
        toggleIsAddVocab();
      case isEditVocabTitle:
        toggleIsEditVocabTitle();
    }
  }, []);

  return (
    <RequireAuth allowedRoles={[1305]}>
      <Head>
        <title>Account | Vocab-It</title>
      </Head>

      <section className="w-full mobile:w-11/12 lg:w-3/5 mx-auto mb-10 py-5 px-4 sm:px-8 rounded-3xl bg-white text-custom-text-light dark:text-custom-text-dark dark:bg-custom-highlight border border-zinc-400 dark:border-zinc-300 shadow-2xl">
        <h1 className='text-2xl mobile:text-3xl md:text-4xl text-center font-semibold dark:text-custom-text-dark mb-4'>My profile</h1>
        <ProfileUsernameSection checkSingleEdit={checkSingleEdit} />
        <ProfileAddVocabSection checkSingleEdit={checkSingleEdit} />
        <ProfileWordSection checkSingleEdit={checkSingleEdit} />
        <DangerZone />
      </section>
      <Toaster />
      <Footer />
    </RequireAuth>
  )
}

Profile.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>{page}</Layout>
  )
}

export default Profile;