import { notFound } from "next/navigation";
import { PostCard } from "@/components/post/PostCard";
import { FadeIn } from "@/components/ui/FadeIn";
import { mockPosts, mockCategories } from "@/lib/mock-data";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = mockCategories.find((c) => c.slug === slug);
  if (!category) return { title: "Khong tim thay" };
  return { title: category.name };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = mockCategories.find((c) => c.slug === slug);

  if (!category) notFound();

  const posts = mockPosts
    .filter((p) => p.category === slug)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="mx-auto max-w-3xl px-6 pb-16 pt-8">
      <div className="mb-12">
        <Link
          href="/"
          className="mb-4 inline-block font-sans text-sm text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
        >
          Tat ca bai viet
        </Link>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
          {category.name}
        </h1>
      </div>

      {posts.length === 0 ? (
        <p className="font-serif text-neutral-500 dark:text-neutral-400">
          Chua co bai viet nao trong danh muc nay.
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
