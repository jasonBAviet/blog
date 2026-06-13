import Link from "next/link";
import Image from "next/image";
import { Post } from "@/types";
import { formatDate } from "@/src/core/utils/utils";
import { PostMeta } from "./PostMeta";
import { TagList } from "./TagList";

export function PostCard({ post, priority = false }: { post: Post; priority?: boolean }) {
  const excerpt = post.content
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 160)
    + "...";

  return (
    <article className="group relative border-b border-neutral-200/60 py-6 last:border-b-0 dark:border-neutral-800/60 sm:py-8">
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

      <div className="mb-2">
        <span className="font-sans text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          {post.categoryName || post.category}
        </span>
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

