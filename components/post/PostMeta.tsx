import { formatDate, estimateReadingTime } from "@/lib/utils";

interface PostMetaProps {
  date: string;
  views: number;
  readingTimeContent?: string;
}

export function PostMeta({ date, views, readingTimeContent }: PostMetaProps) {
  const readingTime = readingTimeContent
    ? estimateReadingTime(readingTimeContent)
    : null;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-xs text-neutral-400 dark:text-neutral-500 sm:text-sm">
      <time dateTime={date} className="whitespace-nowrap">{date}</time>
      {readingTime !== null && (
        <>
          <span className="hidden text-neutral-300 dark:text-neutral-700 sm:inline">/</span>
          <span className="whitespace-nowrap">{readingTime} phut doc</span>
        </>
      )}
      <span className="hidden text-neutral-300 dark:text-neutral-700 sm:inline">/</span>
      <span className="whitespace-nowrap">{views} luot xem</span>
    </div>
  );
}
