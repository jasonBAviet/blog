import { notFound } from "next/navigation";
import Image from "next/image";
import { PostContent } from "@/components/post/PostContent";
import { PostMeta } from "@/components/post/PostMeta";
import { CommentSection } from "@/components/post/CommentSection";
import { ViewCounter } from "@/components/post/ViewCounter";
import { FadeIn } from "@/components/ui/FadeIn";
import { getPostBySlug } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Không tìm thấy" };
  return { title: post.title };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
      <FadeIn>
        <div className="mb-2">
          <span className="font-sans text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            {post.categoryName || post.category}
          </span>
        </div>

        <h1 className="mb-4 font-serif text-2xl font-semibold leading-tight tracking-tight text-neutral-900 dark:text-white sm:text-3xl md:text-4xl">
          {post.title}
        </h1>

        {post.coverImage && (
          <div className="mb-8 overflow-hidden rounded-xl border border-neutral-200/60 dark:border-neutral-800/60">
            <Image
              src={post.coverImage}
              alt={post.title}
              width={1200}
              height={675}
              priority
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {post.images && post.images.length > 1 && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            {post.images.slice(1).map((imageUrl) => (
              <div
                key={imageUrl}
                className="overflow-hidden rounded-xl border border-neutral-200/60 dark:border-neutral-800/60"
              >
                <Image
                  src={imageUrl}
                  alt={post.title}
                  width={1200}
                  height={675}
                  priority={imageUrl === post.images?.[1]}
                  className="h-auto w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mb-10">
          <PostMeta
            date={formatDate(post.createdAt)}
            views={post.views}
            readingTimeContent={post.content}
          />
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <PostContent content={post.content} />
      </FadeIn>

      <CommentSection postSlug={post.slug} />

      <ViewCounter slug={post.slug} />

      <div className="mt-16 border-t border-neutral-200/60 pt-8 dark:border-neutral-800/60">
        <p className="text-center font-serif text-sm text-neutral-400 dark:text-neutral-600">
          --- Het ---
        </p>
      </div>
    </article>
  );
}
