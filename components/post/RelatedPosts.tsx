import Link from "next/link";
import { Post } from "@/types";
import { formatDate } from "@/lib/utils";

export function RelatedPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <div className="mt-12 border-t border-neutral-200/60 pt-8 dark:border-neutral-800/60">
      <h3 className="mb-5 font-serif text-lg font-semibold text-neutral-900 dark:text-white">
        Bai viet lien quan
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {posts.slice(0, 3).map((post) => (
          <Link
            key={post.slug}
            href={`/post/${post.slug}`}
            className="group rounded-xl border border-neutral-200/60 p-4 transition-colors hover:border-neutral-300 hover:bg-neutral-50/50 dark:border-neutral-800/60 dark:hover:border-neutral-700 dark:hover:bg-neutral-900/50"
          >
            <h4 className="mb-1 text-balance font-serif text-sm font-medium text-neutral-900 transition-colors group-hover:text-neutral-600 dark:text-white dark:group-hover:text-neutral-300">
              {post.title}
            </h4>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              {formatDate(post.createdAt)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
