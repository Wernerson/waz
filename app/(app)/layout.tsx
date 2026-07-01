import Image from "next/image";
import Link from "next/link";
import { NewMenuButton } from "../NewMenuButton";
import { SignOutButton } from "../SignOutButton";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="inline-flex items-center">
              <Image src="/logo.png" alt="Logo" width={32} height={32} priority />
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/leads"
                className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
              >
              Leads
              </Link>
              <Link
                href="/issues"
                className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
              >
              Issues
              </Link>
            </nav>
          </div>
          <div className="flex items-start gap-2">
            <NewMenuButton />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
