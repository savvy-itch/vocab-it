import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes';
import { atma } from '@/lib/globals';
import { NextPageWithLayout } from './_app';

import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link';
import {HiOutlineArrowDownCircle, HiOutlineArrowUpCircle} from "react-icons/hi2";
import HomeLayout from '@/components/HomeLayout';
import Navbar from '@/components/Navbar';

const Home: NextPageWithLayout = () => {
  const { theme } = useTheme();
  const [imgSrc, setImgSrc] = useState<string>('/images/vocab-hero-dark.svg');
  const topSectionRef = useRef<HTMLElement>(null);
  const bottomSectionRef = useRef<HTMLElement>(null);

  function goDown() {
    if (topSectionRef.current && bottomSectionRef.current) {
      topSectionRef.current.style.transform = "translateY(-100vh)";
      bottomSectionRef.current.style.transform = "translateY(-100vh)";
    }
  }

  function goUp() {
    if (topSectionRef.current && bottomSectionRef.current) {
      topSectionRef.current.style.transform = "translateY(0)";
      bottomSectionRef.current.style.transform = "translateY(0)";
    }
  }

  useEffect(() => {
    if (!theme || theme === "dark") {
      setImgSrc('/images/vocab-hero-dark.svg');
    } else {
      setImgSrc('/images/vocab-hero.svg')
    }
  }, [theme])

  return (
    <>
      <Head>
        <title>Vocab-It | self-managed vocabularies</title>
      </Head>
      {/* upper screen */}
      <div>
        <section className="relative w-full h-[100dvh] transition ease-in-out duration-300 z-10"
          ref={topSectionRef}
          data-testid="top-section"
        >
          <Navbar />
          <div className="h-[100dvh] sm:w-4/5 mx-auto flex gap-2 justify-center flex-col sm:flex-row sm:justify-between items-center">
            <Image 
              src={imgSrc}
              className="max-w-[70%] mobile:max-w-[50%]"
              width={500}
              height={500}
              alt="lady learning"
              priority
            />
            <div className="text-3xl sm:text-5xl font-bold text-custom-text-light dark:text-custom-text-dark w-11/12 mobile:w-auto text-center sm:text-left">
              <p><span className="text-custom-highlight3">Build</span> vocabularies</p>
              <p><span className="text-custom-highlight3">Study</span> at your pace</p>
            </div>
          </div>
          <button 
            className="absolute w-12 h-12 bottom-2 inset-x-0 mx-auto flex items-center border-custom-text-light dark:border-custom-text-dark hover:border-2 focus:border-2 hover:cursor-pointer rounded-full"
            aria-label="down" 
            onClick={goDown}
          >
            <HiOutlineArrowDownCircle className="w-12 h-12 text-custom-text-light dark:text-custom-text-dark" />
          </button>
          <Image
            className="opacity-20 -z-10 object-cover sm:object-contain"
            src="/images/word-cloud-bg.png"
            fill
            placeholder='blur'
            blurDataURL='/images/word-cloud-bg.png'
            alt="bg word cloud"
            priority
          />
        </section>

        {/* bottom screen */}
        <section className="relative w-11/12 h-screen sm:w-4/5 flex flex-col justify-between mx-auto pt-24 mobile:pt-10 pb-5 sm:pb-10 transition ease-in-out duration-300 text-custom-text-light dark:text-custom-text-dark"
          ref={bottomSectionRef}
          data-testid="bottom-section"
        >
          <button className="absolute w-12 h-12 top-16 mobile:top-2 inset-x-0 mx-auto flex items-center border-custom-text-light dark:border-custom-text-dark hover:border-2 hover:cursor-pointer focus:border-2 rounded-full z-50"
            aria-label="up"
            onClick={goUp}
          >
            <HiOutlineArrowUpCircle className="w-12 h-12 text-custom-text-light dark:text-custom-text-dark" />
          </button>

          <div className="w-full h-[60%] flex flex-col justify-between">
            <div className="w-full md:w-3/4 lg:w-2/4">
              <h2 className="text-2xl mobile:text-3xl md:text-5xl font-bold text-custom-highlight3 mt-7 mb-4 text-center sm:text-left">What is Vocab It?</h2>
              <p className="text-lg mobile:text-xl sm:text-2xl font-semibold break-words">
                <span className={`${atma.className} font-bold`}>Vocab It</span> empowers your language learning without any restrictions, while keeping it user-friendly.</p>
            </div>
            <div className="flex w-full flex-col sm:flex-row justify-between items-center">
              <Image
                src="/images/about-hero.svg"
                className="hidden sm:block sm:max-w-[20%] lg:max-w-[30%]"
                width={300}
                height={300}
                alt="lady studying"
              />
              <div className="w-full sm:w-auto">
                <h2 className="text-2xl mobile:text-3xl md:text-5xl text-custom-highlight3 font-bold mt-7 mb-4 text-center sm:text-left">How to use it?</h2>
                <ol className="text-lg mobile:text-xl sm:text-2xl font-semibold break-words list-decimal list-inside">
                  <li className="my-2">Create vocabularies</li>
                  <li className="my-2">Add words you want to learn</li>
                  <li className="my-2">Practice at your pace</li>
                </ol>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Link href={`/auth/register`}>
              <button className="animated-btn bg-secondary-bg-light flex gap-1 items-center rounded-lg py-3 lg:py-4 px-8 font-semibold text-white text-md lg:text-xl transition hover:animated-btn focus:animated-btn hover:scale-105 hover:cursor-pointer focus:scale-105">
                START NOW
              </button>
            </Link>
          </div>
          <Image 
            className="opacity-20 -z-10 object-cover sm:object-contain"
            src="/images/word-cloud-bg.png"
            fill
            alt="bg word cloud"
            priority
          />
        </section>
      </div>
    </>
  )
}

Home.getLayout = function getLayout(page: ReactElement) {
  return (<HomeLayout>{page}</HomeLayout>)
}

export default Home;