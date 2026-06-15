"use client";
import { useMemo } from "react";
import { Post } from "@/types";
import { PostCard } from "./PostCard";
import { FadeIn } from "@/components/ui/FadeIn";
import { useReadHistory } from "@/hooks/useReadHistory";

export function PostListClient({ posts }: { posts: Post[] }) {
  const { isRead, markAsRead, mounted } = useReadHistory();

  const { unread, read } = useMemo(() => {
    // Before hydration: keep original server order to avoid mismatch
    if (!mounted) return { unread: posts, read: [] as Post[] };
    const unread: Post[] = [];
    const read: Post[] = [];
    for (const post of posts) {
      (isRead(post.slug) ? read : unread).push(post);
    }
    return { unread, read };
  }, [posts, isRead, mounted]);

  return (
    <div>
      {unread.map((post, i) => (
        <FadeIn key={post.slug} delay={i * 0.08}>
          <div onClick={() => markAsRead(post.slug)}>
            <PostCard post={post} priority={i === 0} isRead={false} />
          </div>
        </FadeIn>
      ))}

      {read.length > 0 && (
        <>
          <div className="my-4 flex items-center gap-3 select-none">
            <div className="h-px flex-1 bg-neutral-200/60 dark:bg-neutral-800/60" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Đã đọc
            </span>
            <div className="h-px flex-1 bg-neutral-200/60 dark:bg-neutral-800/60" />
          </div>
          {read.map((post, i) => (
            <FadeIn key={post.slug} delay={i * 0.04}>
              <div onClick={() => markAsRead(post.slug)}>
                <PostCard post={post} priority={false} isRead={true} />
              </div>
            </FadeIn>
          ))}
        </>
      )}
    </div>
  );
}
