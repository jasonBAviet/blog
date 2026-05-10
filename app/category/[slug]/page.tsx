import { notFound } from "next/navigation";
import { PostCard } from "@/components/post/PostCard";
import { FadeIn } from "@/components/ui/FadeIn";
import { getAllPosts, getCategoryBySlug } from "@/lib/store";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category)     return { title: "Không tìm thấy" };
  return { title: category.name };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) notFound();

  const posts = getAllPosts().filter((p) => p.category === slug);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
      <div className="mb-10 sm:mb-12">
        <Link
          href="/"
          className="mb-3 inline-block text-xs text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 sm:mb-4 sm:text-sm"
        >
          Tất cả bài viết
        </Link>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
          {category.name}
        </h1>
      </div>

      {posts.length === 0 ? (
        <p className="font-serif text-neutral-500 dark:text-neutral-400">
          Chưa có bài viết nào trong danh mục này.
        </p>
      ) : (
        <div>
          {posts.map((post, i) => (
            <FadeIn key={post.slug} delay={i * 0.08}>
              <PostCard post={post} priority={i === 0} />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
