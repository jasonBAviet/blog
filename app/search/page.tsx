import { searchPosts, highlightText } from "@/lib/search";
import { PostCard } from "@/components/post/PostCard";
import { FadeIn } from "@/components/ui/FadeIn";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  if (!q) return { title: "Tim kiem" };
  return { title: `Ket qua tim kiem: ${q}` };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  if (!query || query.length < 2) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
        <h1 className="mb-4 font-serif text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
          Tim kiem
        </h1>
        <form action="/search" method="get" className="mb-8">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="6.5" cy="6.5" r="4" />
              <path d="M10 10l3.5 3.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              name="q"
              placeholder="Nhap tu khoa tim kiem (it nhat 2 ky tu)..."
              defaultValue={query}
              className="w-full rounded-xl border border-neutral-200/60 bg-neutral-50/50 py-3 pl-11 pr-4 text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-300 focus:bg-white focus:outline-none dark:border-neutral-800/60 dark:bg-neutral-900/50 dark:text-white dark:placeholder-neutral-500 dark:focus:border-neutral-700 dark:focus:bg-neutral-900"
            />
          </div>
        </form>
        <p className="text-center font-serif text-sm text-neutral-400 dark:text-neutral-500">
          Nhap tu khoa de bat dau tim kiem
        </p>
      </div>
    );
  }

  const results = searchPosts(query);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
      <div className="mb-10 sm:mb-12">
        <Link
          href="/"
          className="mb-3 inline-block text-xs text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 sm:mb-4 sm:text-sm"
        >
          Tat ca bai viet
        </Link>
        <h1 className="mb-2 font-serif text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
          Ket qua tim kiem
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          <span className="font-medium text-neutral-900 dark:text-white">
            {results.length}
          </span>{" "}
          bai viet cho tu khoa &quot;{query}&quot;
        </p>
      </div>

      <form action="/search" method="get" className="mb-8">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="6.5" cy="6.5" r="4" />
            <path d="M10 10l3.5 3.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            name="q"
            placeholder="Tim kiem tiep..."
            defaultValue={query}
            className="w-full rounded-xl border border-neutral-200/60 bg-neutral-50/50 py-2.5 pl-11 pr-4 text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:border-neutral-300 focus:bg-white focus:outline-none dark:border-neutral-800/60 dark:bg-neutral-900/50 dark:text-white dark:placeholder-neutral-500 dark:focus:border-neutral-700 dark:focus:bg-neutral-900"
          />
        </div>
      </form>

      {results.length === 0 ? (
        <div className="py-16 text-center">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-neutral-300 dark:text-neutral-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1"
          >
            <circle cx="10.5" cy="10.5" r="6" />
            <path d="M15 15l5 5" strokeLinecap="round" />
          </svg>
          <p className="font-serif text-neutral-500 dark:text-neutral-400">
            Khong tim thay bai viet nao cho tu khoa &quot;{query}&quot;
          </p>
        </div>
      ) : (
        <div>
          {results.map(({ post }, i) => (
            <FadeIn key={post.slug} delay={i * 0.08}>
              <PostCard post={post} priority={i === 0} />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
