"use client";
import { useEffect } from "react";
import { useReadHistory } from "@/hooks/useReadHistory";

export function ReadTracker({ slug }: { slug: string }) {
  const { markAsRead, mounted } = useReadHistory();
  // Wait for session to be established before marking as read
  useEffect(() => {
    if (!mounted) return;
    markAsRead(slug);
  }, [slug, markAsRead, mounted]);
  return null;
}
