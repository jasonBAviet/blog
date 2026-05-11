"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SearchResult } from "@/lib/search";

export function SearchInput() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchResults = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results.slice(0, 5));
      setOpen(true);
      setSelectedIndex(-1);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchResults(query), 300);
    return () => clearTimeout(timer);
  }, [query, fetchResults]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : results.length - 1
      );
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      setOpen(false);
      router.push(`/post/${results[selectedIndex].post.slug}`);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="6.5" cy="6.5" r="4" />
          <path d="M10 10l3.5 3.5" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          placeholder="Tim kiem..."
          className="h-9 w-44 rounded-lg border border-neutral-200/60 bg-neutral-50/50 pl-9 pr-3 text-sm text-neutral-900 placeholder-neutral-400 transition-all focus:w-56 focus:border-neutral-300 focus:bg-white focus:outline-none dark:border-neutral-800/60 dark:bg-neutral-900/50 dark:text-white dark:placeholder-neutral-500 dark:focus:border-neutral-700 dark:focus:bg-neutral-900 sm:text-sm"
        />
        {loading && (
          <svg
            className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-neutral-400"
            viewBox="0 0 16 16"
            fill="none"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              strokeWidth="2"
              className="opacity-25"
            />
            <path
              d="M14 8a6 6 0 00-10.24-4.24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="opacity-75"
            />
          </svg>
        )}
      </form>

      {open && results.length > 0 && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-80 overflow-hidden rounded-xl border border-neutral-200/60 bg-white shadow-lg dark:border-neutral-800/60 dark:bg-neutral-900">
          <ul>
            {results.map((result, i) => (
              <li key={result.post.slug}>
                <Link
                  href={`/post/${result.post.slug}`}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-2.5 transition-colors ${
                    i === selectedIndex
                      ? "bg-neutral-100 dark:bg-neutral-800"
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  }`}
                >
                  <span className="block text-sm font-medium text-neutral-900 dark:text-white">
                    {result.post.title}
                  </span>
                  {result.snippet && (
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                      {result.snippet}
                    </span>
                  )}
                  <span className="mt-1 block text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    {result.post.categoryName || result.post.category}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={`/search?q=${encodeURIComponent(query.trim())}`}
            onClick={() => setOpen(false)}
            className="block border-t border-neutral-200/60 px-4 py-2 text-center text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-50 dark:border-neutral-800/60 dark:text-neutral-400 dark:hover:bg-neutral-800/50"
          >
            Xem tat ca ket qua
          </Link>
        </div>
      )}
    </div>
  );
}
