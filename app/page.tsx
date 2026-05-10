import { PostCard } from "@/components/post/PostCard";
import { FadeIn } from "@/components/ui/FadeIn";
import { getAllPosts } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-3xl px-6 pb-16 pt-8">
      <div className="mb-12">
        <h1 className="mb-3 font-serif text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
          Blog ca nhan
        </h1>
        <p className="max-w-md font-serif leading-relaxed text-neutral-500 dark:text-neutral-400">
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
    </div>
  );
}
