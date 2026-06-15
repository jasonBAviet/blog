"use client";
import { useState, useEffect, useCallback } from "react";

export function useReadHistory() {
  const [readSlugs, setReadSlugs] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fetch("/api/session", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.reads)) {
          setReadSlugs(new Set(data.reads));
        }
        // Gửi timezone về server (chỉ cần gửi 1 lần khi session mới)
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz) {
          fetch("/api/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ timezone: tz }),
          }).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setMounted(true));
  }, []);

  const markAsRead = useCallback((slug: string) => {
    setReadSlugs((prev) => {
      if (prev.has(slug)) return prev;
      // Optimistic update
      const next = new Set(prev);
      next.add(slug);
      return next;
    });
    fetch("/api/session/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ slug }),
    }).catch(() => {});
  }, []);

  const isRead = useCallback(
    (slug: string) => readSlugs.has(slug),
    [readSlugs]
  );

  return { readSlugs, markAsRead, isRead, mounted };
}
