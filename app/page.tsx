import Link from "next/link";
import { PostCard } from "@/components/post/PostCard";
import { FadeIn } from "@/components/ui/FadeIn";
import { Pagination } from "@/components/ui/Pagination";
import { KnowledgeGraph } from "@/components/kg/KnowledgeGraph";
import { getAllPosts, getPaginatedPosts } from "@/lib/store";

export const dynamic = "force-dynamic";

const POSTS_PER_PAGE = 10;

interface PageProps {
  searchParams: Promise<{ page?: string; view?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { page: pageParam, view } = await searchParams;
  const currentView = view === "kg" ? "kg" : "list";
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10) || 1);
  const { posts, totalPages, page } = await getPaginatedPosts(currentPage, POSTS_PER_PAGE);
  const allPosts = await getAllPosts();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
      <div className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-2 font-serif text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:mb-3 sm:text-3xl">
            Blog ca nhan
          </h1>
          <p className="max-w-md text-sm font-serif leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-base">
            Noi chia se ve cong nghe, doi song va nhung suy ngam.
          </p>
        </div>

        <div className="inline-flex rounded-full border border-neutral-200/70 bg-white p-1 text-sm shadow-sm dark:border-neutral-800/70 dark:bg-neutral-950">
          <Link
            href="/"
            className={
              "rounded-full px-4 py-2 transition-colors " +
              (currentView === "list"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white")
            }
          >
            List
          </Link>
          <Link
            href="/?view=kg"
            className={
              "rounded-full px-4 py-2 transition-colors " +
              (currentView === "kg"
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white")
            }
          >
            KG D3
          </Link>
        </div>
      </div>

      {currentView === "kg" ? (
        <FadeIn>
          <KnowledgeGraph posts={allPosts} />
        </FadeIn>
      ) : (
        <div>
          {posts.map((post, i) => (
            <FadeIn key={post.slug} delay={i * 0.08}>
              <PostCard post={post} priority={i === 0} />
            </FadeIn>
          ))}
        </div>
      )}

      {currentView === "list" && <Pagination page={page} totalPages={totalPages} basePath="/?view=list" />}
    </div>
  );
}
