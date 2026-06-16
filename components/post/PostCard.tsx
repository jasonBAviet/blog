import Link from "next/link";
import Image from "next/image";
import { Post } from "@/types";
import { formatDate, cleanHtml, extractConclusion } from "@/src/core/utils/utils";
import { PostMeta } from "./PostMeta";
import { TagList } from "./TagList";

export function PostCard({ post, priority = false, isRead = false }: { post: Post; priority?: boolean; isRead?: boolean }) {
  const plainText = cleanHtml(post.content);
  const conclusion = extractConclusion(post.content, post.summary);

  // Sử dụng kết luận làm phần preview nếu có, giới hạn tối đa 500 ký tự
  // Nếu không có kết luận, sử dụng 400 ký tự đầu tiên của bài viết
  let excerpt = "";
  if (conclusion) {
    excerpt = conclusion.substring(0, 500) + (conclusion.length > 500 ? "..." : "");
  } else {
    excerpt = plainText.substring(0, 400) + (plainText.length > 400 ? "..." : "");
  }

  return (
    <article className={`group relative border-b border-neutral-200/60 py-6 last:border-b-0 dark:border-neutral-800/60 sm:py-8 transition-opacity${isRead ? " opacity-50" : ""}`}>
      {post.coverImage && (
        <Link href={`/post/${post.slug}`} className="mb-4 block overflow-hidden rounded-xl border border-neutral-200/60 dark:border-neutral-800/60">
          <Image
            src={post.coverImage}
            alt={post.title}
            width={1200}
            height={675}
            priority={priority}
            sizes="(max-width: 768px) 100vw, 768px"
            className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
          />
        </Link>
      )}

      <div className="mb-2 flex items-center gap-2">
        <span className="font-sans text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          {post.categoryName || post.category}
        </span>
        {isRead && (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500">
            <svg className="h-2.5 w-2.5" viewBox="0 0 10 10" fill="currentColor">
              <path d="M8.5 2.5L4 7 1.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            Đã đọc
          </span>
        )}
      </div>

      <h2 className="mb-2 text-balance font-serif text-lg font-semibold leading-snug text-neutral-900 transition-colors group-hover:text-neutral-600 dark:text-white dark:group-hover:text-neutral-300 sm:text-xl">
        <Link href={`/post/${post.slug}`}>
          <span className="absolute inset-0" aria-hidden="true"></span>
          {post.title}
        </Link>
      </h2>

      <p className="mb-3 text-sm font-serif leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-base">
        {excerpt}
      </p>

      {post.tags && post.tags.length > 0 && (
        <div className="mb-3 relative z-10">
          <TagList tags={post.tags} />
        </div>
      )}

      <div className="relative z-10">
        <PostMeta
          date={formatDate(post.createdAt)}
          views={post.views}
        />
      </div>
    </article>
  );
}


