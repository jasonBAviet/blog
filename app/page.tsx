import { PostCard } from "@/components/post/PostCard";
import { FadeIn } from "@/components/ui/FadeIn";
import { Pagination } from "@/components/ui/Pagination";
import { getPaginatedPosts } from "@/lib/store";

export const dynamic = "force-dynamic";

const POSTS_PER_PAGE = 10;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10) || 1);
  const { posts, totalPages, page } = getPaginatedPosts(currentPage, POSTS_PER_PAGE);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
      <div className="mb-10 sm:mb-12">
        <h1 className="mb-2 font-serif text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:mb-3 sm:text-3xl">
          Blog ca nhan
        </h1>
        <p className="max-w-md text-sm font-serif leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-base">
          Noi chia se ve cong nghe, doi song va nhung suy ngam.
        </p>
      </div>

      <div>
        {posts.map((post, i) => (
          <FadeIn key={post.slug} delay={i * 0.08}>
            <PostCard post={post} priority={i === 0} />
          </FadeIn>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}
