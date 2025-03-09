import React, { ReactElement, SyntheticEvent, useEffect, useRef, useState } from 'react';
import { NextPageWithLayout } from '../../_app';
import Head from 'next/head';
import Footer from '@/components/Footer';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { BASE_URL, PWD_MAX_LENGTH, PWD_MIN_LENGTH, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from '@/lib/globals';
import { useAuthStore } from '@/lib/authStore';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';
import { CustomPayload } from '@/lib/types';
import { usePreferencesStore } from '@/lib/preferencesStore';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import InputRequirement from '@/components/InputRequirement';

const USER_LENGTH_REGEX = /^.{3,16}$/;
const USER_LETTER_REGEX = /^(?=.*[A-Za-z])[A-Za-z0-9]+$/; // must contain a letter
const PWD_LENGTH_REGEX = /^.{8,20}$/;
const PWD_UPPERCASE_REGEX = /[A-Z]+/;
const PWD_SYMBOL_REGEX = /.*[!@#$%\-\+=_]/;

const Registration: NextPageWithLayout = () => {
  const userRef = useRef<HTMLInputElement | null>(null);
  const errRef = useRef<HTMLParagraphElement | null>(null);

  const [user, setUser] = useState('');
  const [userLong, setUserLong] = useState(false);
  const [userHasLetter, setUserHasLetter] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [pwd, setPwd] = useState('');
  const [pwdFocus, setPwdFocus] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [pwdLong, setPwdLong] = useState(false);
  const [pwdUpperCase, setPwdUpperCase] = useState(false);
  const [pwdSymbol, setPwdSymbol] = useState(false);


  const [matchPwd, setMatchPwd] = useState('');
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);
  const [confirmPwd, setConfirmPwd] = useState(false);

  const [errMsg, setErrMsg] = useState('');

  const { setAccessToken } = useAuthStore(state => state);
  const { setStoredUsername } = usePreferencesStore();
  const router = useRouter();

  async function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    const isUsernameValid = USER_LENGTH_REGEX.test(user) && USER_LETTER_REGEX.test(user);
    const isPwdValid = PWD_LENGTH_REGEX.test(pwd) && PWD_UPPERCASE_REGEX.test(pwd) && PWD_SYMBOL_REGEX.test(pwd);
    if (!isUsernameValid || !isPwdValid) {
      setErrMsg('Invalid Entry');
      return;
    }

    try {
      const trimmedUsername = user.trim();
      const trimmedPwd = pwd.trim();
      const res = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: trimmedUsername, pwd: trimmedPwd }),
        credentials: 'include'
      });

      if (!res.ok) {
        if (res.status === 400) {
          setErrMsg('Missing Username or Password');
        } else if (res.status === 409) {
          setErrMsg('Username Taken');
        } else if (res.status === 500) {
          setErrMsg('Internal Server Error');
        } else {
          setErrMsg('Registration Failed');
        }
        return;
      }

      const data = await res.json();
      const accessToken = data.accessToken;
      if (!accessToken) {
        setErrMsg('Invalid credentials');
        return;
      }

      setAccessToken(accessToken);
      const decoded = jwtDecode<CustomPayload>(accessToken);
      setStoredUsername(decoded.UserInfo.username);
      router.push('/profile');
    } catch (error) {
      setErrMsg('No Server Response');
      errRef.current?.focus();
      console.error(error);
    }
  }

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  useEffect(() => {
    const isUsernameLong = USER_LENGTH_REGEX.test(user);
    setUserLong(isUsernameLong);
    const hasLetter = USER_LETTER_REGEX.test(user);
    setUserHasLetter(hasLetter);

    const isPwdLong = PWD_LENGTH_REGEX.test(pwd);
    setPwdLong(isPwdLong);
    const hasUpperCase = PWD_UPPERCASE_REGEX.test(pwd);
    setPwdUpperCase(hasUpperCase);
    const hasSymbol = PWD_SYMBOL_REGEX.test(pwd);
    setPwdSymbol(hasSymbol);

    const match = pwd === matchPwd;
    setValidMatch(match);
  }, [user, pwd, matchPwd]);

  return (
    <>
      <Head>
        <title>Registration</title>
      </Head>
      <section className="w-11/12 lg:w-3/5 mx-auto mb-10 py-5 px-4 sm:px-8 rounded-3xl bg-white text-custom-text-light dark:text-custom-text-dark dark:bg-custom-highlight border border-zinc-400 dark:border-zinc-300 shadow-2xl">
        <form
          className="flex flex-col gap-8"
          onSubmit={handleSubmit}
        >
          <h1 className='text-2xl mobile:text-3xl md:text-4xl text-center font-semibold dark:text-custom-text-dark mb-2'>Create an account</h1>
          <p
            className="text-red-400 text-center"
            ref={errRef}
            aria-live="assertive"
          >
            {errMsg}
          </p>
          <div>
            <label htmlFor="username">
              <p>Username:</p>
              <input
                className={`${user.length === 0
                  ? 'border-white'
                  : (userHasLetter && userLong)
                    ? 'border-green-500'
                    : 'border-red-500'} border text-lg leading-9 px-2 rounded-sm w-full sm:w-2/3 lg:w-1/2`}
                ref={userRef}
                type="text"
                id="username"
                placeholder="Enter username..."
                required
                minLength={USERNAME_MIN_LENGTH}
                maxLength={USERNAME_MAX_LENGTH}
                onChange={(e) => setUser(e.target.value)}
                onFocus={() => setUserFocus(true)}
                onBlur={() => setUserFocus(false)}
              />
            </label>
            <InputRequirement isInputEmpty={user.length === 0} requirement={userLong} text={`Must be ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} characters long`} />
            <InputRequirement isInputEmpty={user.length === 0} requirement={userHasLetter} text={'Must contain a letter'} />
          </div>

          <div>
            <label htmlFor="password">
              <p>Password:</p>
              <input
                className={`${pwd.length === 0
                  ? 'border-white'
                  : (pwdLong && pwdSymbol && pwdUpperCase)
                    ? 'border-green-500'
                    : 'border-red-500'} border text-lg leading-9 px-2 rounded-sm w-full sm:w-2/3 lg:w-1/2`}
                type={showPwd ? "text" : "password"}
                id="password"
                required
                placeholder="Enter password..."
                value={pwd}
                minLength={PWD_MIN_LENGTH}
                maxLength={PWD_MAX_LENGTH}
                onChange={(e) => setPwd(e.target.value)}
                onFocus={() => setPwdFocus(true)}
                onBlur={() => setPwdFocus(false)}
              />
            </label>
            <button className="ml-4 hover:cursor-pointer" type="button" onClick={() => setShowPwd(!showPwd)}>
              {showPwd ? <FaEye /> : <FaEyeSlash />}
            </button>
            <InputRequirement isInputEmpty={pwd.length === 0} requirement={pwdLong} text={`Must be ${PWD_MIN_LENGTH}-${PWD_MAX_LENGTH} characters long`} />
            <InputRequirement isInputEmpty={pwd.length === 0} requirement={pwdUpperCase} text={'Must contain an uppercase letter'} />
            <InputRequirement isInputEmpty={pwd.length === 0} requirement={pwdSymbol} text={'Must contain a special symbol'} />
          </div>

          <div>
            <label htmlFor="confirm-password">
              <p>Confirm Password:</p>
              <input
                className={`${matchPwd.length === 0
                  ? 'border-white'
                  : validMatch
                    ? 'border-green-500'
                    : 'border-red-500'} border text-lg leading-9 px-2 rounded-sm w-full sm:w-2/3 lg:w-1/2`}
                type={confirmPwd ? "text" : "password"}
                id="confirm-password"
                required
                value={matchPwd}
                placeholder="Confirm password..."
                onChange={(e) => setMatchPwd(e.target.value)}
                onFocus={() => setMatchFocus(true)}
                onBlur={() => setMatchFocus(false)}
              />
            </label>
            <button className="ml-4 hover:cursor-pointer" type="button" onClick={() => setConfirmPwd(!confirmPwd)}>
              {confirmPwd ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
          <button
            className="rounded-full bg-white mobile:bg-btn-bg mobile:hover:bg-hover-btn-bg mobile:focus:bg-hover-btn-bg mobile:text-white cursor-pointer text-lg mobile:px-3 mobile:py-2 mobile:rounded-sm disabled:text-gray-400 disabled:cursor-not-allowed"
            disabled={!userHasLetter || !userLong || !pwdLong || !pwdUpperCase || !pwdSymbol || !validMatch ? true : false}
          >
            Sign Up
          </button>
        </form>
        <p className="dark:text-custom-text-dark mt-2">
          Already have an account?<br />
          <span>
            <Link className="underline" href="/auth/login">Sign In</Link>
          </span>
        </p>
      </section>
      <Footer />
    </>
  )
}

Registration.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>{page}</Layout>
  )
}

export default Registration;
