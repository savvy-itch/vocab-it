import useAuth from '@/hooks/useAuth';
import { BASE_URL, specialSymbols } from '@/lib/globals'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import useDisplayPopup from '@/hooks/useDisplayPopup';
import useVocabStore from '@/lib/store';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';
import CustomTooltip from './CustomTooltip';

export default function SelectLang() {
  const fetchWithAuth = useAuth();
  const { currVocab, setCurrVocab } = useVocabStore(state => state);
  const { displayPopup } = useDisplayPopup();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedLang, setSelectedLang] = useState('default');

  function handleLangChange(updatedLang: string) {
    if (updatedLang !== selectedLang) {
      setSelectedLang(updatedLang);

      if (updatedLang === 'default' || Object.keys(specialSymbols).includes(updatedLang)) {
        setIsUpdating(true);
        const controller = new AbortController();

        const updateLang = async () => {
          try {
            const res = await fetchWithAuth(`${BASE_URL}/vocabs/updateLang`, {
              method: 'PATCH',
              signal: controller.signal,
              body: JSON.stringify({ vocabId: currVocab?._id, updatedLang }),
              credentials: 'include'
            });

            if (!res.ok) {
              displayPopup({ isError: true, msg: "Language could not be updated" });
              throw new Error('Failed to update language');
            }

            const updatedVocab = await res.json();
            setCurrVocab(updatedVocab);
            displayPopup({ isError: false, msg: "Language has been updated" });
          } catch (error) {
            currVocab?.lang && setSelectedLang(currVocab?.lang);
            console.error(error);
          } finally {
            setIsUpdating(false);
          }
        }

        updateLang();
        return () => controller.abort();
      }
    }
  };

  useEffect(() => {
    if (currVocab && currVocab.lang) {
      setSelectedLang(currVocab.lang);
    }
  }, [currVocab]);

  return (
    <section className="w-full flex items-start mx-auto gap-2 my-3">
      <Select
        value={selectedLang}
        onValueChange={handleLangChange}
        disabled={isUpdating}
        name="langs"
      >
        <SelectTrigger className="w-3/4 mobile:w-[180px] bg-white dark:border-custom-highlight dark:bg-main-bg-dark border border-slate-200">
          <SelectValue placeholder="Select a language" />
        </SelectTrigger>
        <SelectContent className="dark:border-custom-highlight dark:bg-main-bg-dark">
          <SelectGroup>
            <SelectLabel>Languages</SelectLabel>
            <SelectItem className="text-custom-text-light dark:text-white hover:bg-slate-300 dark:hover:bg-custom-highlight focus:bg-slate-200 focus:text-slate-900 dark:focus:bg-custom-highlight" value="default">No language</SelectItem>
            {Object.keys(specialSymbols).map(lang => {
              return <SelectItem className="text-custom-text-light dark:text-white hover:bg-slate-300 dark:hover:bg-custom-highlight focus:bg-slate-200 focus:text-slate-900 dark:focus:bg-custom-highlight" value={lang} key={lang}>{lang}</SelectItem>
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
      <CustomTooltip text="Selecting a language will display a keyboard of special symbols during lessons" />
    </section>
  )
}
