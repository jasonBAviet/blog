"use client";

import { useEffect, useState } from "react";

const REACTIONS = [
  { type: "like", emoji: "👍", label: "Thich" },
  { type: "love", emoji: "❤️", label: "Yeu thich" },
  { type: "insightful", emoji: "💡", label: "Sau sac" },
  { type: "appreciate", emoji: "👏", label: "Dang tran trong" },
] as const;

interface ReactionBarProps {
  slug: string;
  initialReactions: Record<string, number>;
}

export function ReactionBar({ slug, initialReactions }: ReactionBarProps) {
  const [reactions, setReactions] = useState<Record<string, number>>(initialReactions);
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(`reacted_${slug}`);
    if (saved) setSelected(saved);
  }, [slug]);

  async function handleReact(type: string) {
    if (selected || pending) return;
    setPending(type);

    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, type }),
      });
      if (res.ok) {
        const data = await res.json();
        setReactions(data.reactions);
        setSelected(type);
        sessionStorage.setItem(`reacted_${slug}`, type);
      }
    } catch {
      // silent fail
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="mt-10 border-t border-neutral-200/60 pt-6 dark:border-neutral-800/60">
      <p className="mb-3 text-center font-serif text-sm text-neutral-500 dark:text-neutral-400">
        Ban thay bai viet nay the nao?
      </p>
      <div className="flex items-center justify-center gap-2">
        {REACTIONS.map(({ type, emoji, label }) => {
          const count = reactions[type] || 0;
          const isSelected = selected === type;
          const isPending = pending === type;

          return (
            <button
              key={type}
              onClick={() => handleReact(type)}
              disabled={!!selected || !!pending}
              title={label}
              className={
                "flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm transition-all " +
                (isSelected
                  ? "border-neutral-900 bg-neutral-100 dark:border-white dark:bg-neutral-800"
                  : "border-neutral-200/60 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800/60 dark:hover:border-neutral-700 dark:hover:bg-neutral-900/50") +
                (selected && !isSelected ? " opacity-50" : "")
              }
            >
              <span className={isPending ? "animate-bounce" : ""}>{emoji}</span>
              <span className="min-w-[1ch] text-xs text-neutral-500 dark:text-neutral-400">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
