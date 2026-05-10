"use client";

import { useEffect } from "react";

export function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    const viewed = sessionStorage.getItem(`viewed_${slug}`);
    if (viewed) return;
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    sessionStorage.setItem(`viewed_${slug}`, "1");
  }, [slug]);

  return null;
}
