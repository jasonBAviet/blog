"use client";
import { useEffect } from "react";
import { useReadHistory } from "@/hooks/useReadHistory";

export function ReadTracker({ slug }: { slug: string }) {
  const { markAsRead } = useReadHistory();
  useEffect(() => {
    markAsRead(slug);
  }, [slug, markAsRead]);
  return null;
}
