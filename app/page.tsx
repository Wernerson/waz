import { SignOutButton } from "./SignOutButton";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <main className="flex w-full max-w-md flex-col gap-6 border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Welcome
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            You are signed in with password authentication.
          </p>
        </div>
        <SignOutButton />
      </main>
    </div>
  );
}
