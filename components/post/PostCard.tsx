import Link from "next/link";
import Image from "next/image";
import { Post } from "@/types";
import { formatDate } from "@/lib/utils";
import { PostMeta } from "./PostMeta";

export function PostCard({ post, priority = false }: { post: Post; priority?: boolean }) {
  const excerpt = post.content
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 160)
    + "...";

  return (
    <article className="group border-b border-neutral-200/60 py-8 last:border-b-0 dark:border-neutral-800/60">
      <Link href={`/post/${post.slug}`} className="block">
        {post.coverImage && (
          <div className="mb-4 overflow-hidden rounded-xl border border-neutral-200/60 dark:border-neutral-800/60">
            <Image
              src={post.coverImage}
              alt={post.title}
              width={1200}
              height={675}
              priority={priority}
              sizes="(max-width: 768px) 100vw, 768px"
              className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
            />
          </div>
        )}

        <div className="mb-2">
          <span className="font-sans text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            {post.categoryName || post.category}
          </span>
        </div>

        <h2 className="mb-2 font-serif text-xl font-semibold leading-snug text-neutral-900 transition-colors group-hover:text-neutral-600 dark:text-white dark:group-hover:text-neutral-300">
          {post.title}
        </h2>

        <p className="mb-3 font-serif leading-relaxed text-neutral-500 dark:text-neutral-400">
          {excerpt}
        </p>

        <PostMeta
          date={formatDate(post.createdAt)}
          views={post.views}
        />
      </Link>
    </article>
  );
}
