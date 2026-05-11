"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SearchInput } from "@/components/search/SearchInput";

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isPost = pathname.startsWith("/post/");
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => setMounted(true), []);

  if (isAdmin) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/60 bg-white/80 backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-12 max-w-3xl items-center justify-between gap-2 px-4 sm:h-14 sm:px-6">
        <Link
          href="/"
          className="shrink-0 font-serif text-base font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-lg"
        >
          Blog
        </Link>

        <nav className="flex items-center gap-2">
          <SearchInput />
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 sm:h-8 sm:w-8"
              aria-label="Chuyen doi dark mode"
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1A.5.5 0 018 1zm0 10a3 3 0 100-6 3 3 0 000 6zm6.5-2.5a.5.5 0 010 1h-1a.5.5 0 010-1h1zM8 13a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1A.5.5 0 018 13zm-5.5-4.5a.5.5 0 010 1h-1a.5.5 0 010-1h1zm.646-6.354a.5.5 0 01.708 0l.707.707a.5.5 0 11-.708.708l-.707-.707a.5.5 0 010-.708zm9 9a.5.5 0 01.708 0l.707.707a.5.5 0 11-.708.708l-.707-.707a.5.5 0 010-.708zM2.146 2.146a.5.5 0 000 .708l.707.707a.5.5 0 10.708-.708l-.707-.707a.5.5 0 00-.708 0zm9 9a.5.5 0 000 .708l.707.707a.5.5 0 10.708-.708l-.707-.707a.5.5 0 00-.708 0zM8 1a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1A.5.5 0 018 1z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6 .278a.768.768 0 01.08.858 7.208 7.208 0 00-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 01.81.316.733.733 0 01-.031.893A8.349 8.349 0 018.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 016 .278z" />
                </svg>
              )}
            </button>
          )}
        </nav>
      </div>
      {isPost && <ReadingProgress />}
    </header>
  );
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="h-[2px] w-full bg-neutral-100 dark:bg-neutral-800">
      <div
        className="h-full bg-neutral-900 transition-[width] duration-150 ease-out dark:bg-white"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
