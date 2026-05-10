import { PostCard } from "@/components/post/PostCard";
import { FadeIn } from "@/components/ui/FadeIn";
import { getAllPosts } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
      <div className="mb-10 sm:mb-12">
        <h1 className="mb-2 font-serif text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:mb-3 sm:text-3xl">
          Blog cá nhân
        </h1>
        <p className="max-w-md text-sm font-serif leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-base">
          Nơi chia sẻ về công nghệ, đời sống và những suy ngẫm.
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
