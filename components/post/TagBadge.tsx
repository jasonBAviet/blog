import Link from "next/link";

export function TagBadge({ tag }: { tag: string }) {
  return (
    <Link
      href={`/tag/${encodeURIComponent(tag.toLowerCase())}`}
      className="inline-block rounded-full border border-neutral-200/60 px-2.5 py-0.5 font-sans text-[11px] text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-700 dark:border-neutral-800/60 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-neutral-200"
    >
      {tag}
    </Link>
  );
}
