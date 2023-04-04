import { SignInButton, SignOutButton, useUser } from '@clerk/nextjs';
import { type NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';

import { api } from '~/utils/api';

const Home: NextPage = () => {
  const [input, setInput] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [error, setError] = useState('');

  const { mutate, isLoading } = api.gpt.ask.useMutation({
    onSuccess: ({ steps }) => {
      setSteps(steps);
    },
    onError: (e) => {
      setSteps([]);
      setInput('');
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        setError(errorMessage[0]);
      } else {
        setError('Oops! Something went wrong.');
      }
    },
  });
  const user = useUser();

  return (
    <>
      <Head>
        <title>Make Me a Meal</title>
        <meta name="description" content="Get a meal suggestion!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-600 md:max-w-5xl">
          <div className="flex h-24 justify-end border-b border-slate-600 p-4">
            <div className="flex grow items-center gap-4">
              {user.isSignedIn && (
                <>
                  <Image
                    className="rounded-full"
                    width={50}
                    height={50}
                    src={user?.user?.profileImageUrl}
                    alt={`${user?.user?.username || ''}'s profile picture'`}
                  />
                  <span className="italic text-slate-400">
                    @{user?.user?.username}
                  </span>
                </>
              )}
            </div>
            {user.isSignedIn ? <SignOutButton /> : <SignInButton />}
          </div>
          {user.isSignedIn && (
            <div className="flex flex-col items-center justify-center p-2">
              <div className="relative my-3 w-full">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return;
                    e.preventDefault();
                    if (input === '') return;
                    setSteps([]);
                    setError('');
                    mutate({ text: input });
                  }}
                  disabled={isLoading}
                  id="input-group-1"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pr-10 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  placeholder="What's on your fridge?"
                />
                <InputMessage />
              </div>
              {isLoading && (
                <div className="flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              )}
              <div className="w-full">
                {!error &&
                  steps.length > 0 &&
                  steps.map((step, i) => <p key={i}>{step}</p>)}
              </div>
              <div>{error && <p>{error}</p>}</div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;

const LoadingSpinner = () => {
  return (
    <div role="status">
      <svg
        aria-hidden="true"
        className="mr-2 h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

const InputMessage = () => {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
      <svg
        stroke="currentColor"
        fill="none"
        stroke-width="2"
        viewBox="0 0 24 24"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="mr-1 h-4 w-4 text-slate-500"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    </div>
  );
};
