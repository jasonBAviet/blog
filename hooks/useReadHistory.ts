"use client";
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "blog_read_history";

function readFromStorage(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function writeToStorage(slugs: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...slugs]));
  } catch {}
}

export function useReadHistory() {
  const [readSlugs, setReadSlugs] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setReadSlugs(readFromStorage());
    setMounted(true);
  }, []);

  const markAsRead = useCallback((slug: string) => {
    // Always read from storage first to avoid race with init effect
    const next = readFromStorage();
    next.add(slug);
    writeToStorage(next);
    setReadSlugs(new Set(next));
  }, []);

  const isRead = useCallback((slug: string) => readSlugs.has(slug), [readSlugs]);

  return { readSlugs, markAsRead, isRead, mounted };
}
