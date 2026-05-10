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
    <div className="flex items-center gap-3 font-sans text-sm text-neutral-400 dark:text-neutral-500">
      <time dateTime={date}>{date}</time>
      {readingTime !== null && (
        <>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span>{readingTime} phut doc</span>
        </>
      )}
      <span className="text-neutral-300 dark:text-neutral-700">/</span>
      <span>{views} luot xem</span>
    </div>
  );
}
