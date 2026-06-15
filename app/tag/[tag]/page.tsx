import { notFound } from "next/navigation";
import { PostListClient } from "@/components/post/PostListClient";
import { getPostsByTag } from "@/src/core/utils/store";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  return { title: `Tag: ${decodeURIComponent(tag)}` };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = await getPostsByTag(decodedTag);

  if (posts.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
        <Link
          href="/"
          className="mb-3 inline-block text-xs text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 sm:mb-4 sm:text-sm"
        >
          Tat ca bai viet
        </Link>
        <h1 className="mb-4 font-serif text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
          Tag: {decodedTag}
        </h1>
        <p className="font-serif text-neutral-500 dark:text-neutral-400">
          Khong co bai viet nao voi tag nay.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
      <div className="mb-10 sm:mb-12">
        <Link
          href="/"
          className="mb-3 inline-block text-xs text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 sm:mb-4 sm:text-sm"
        >
          Tat ca bai viet
        </Link>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
          Tag: {decodedTag}
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {posts.length} bai viet
        </p>
      </div>

      <PostListClient posts={posts} />
    </div>
  );
}
