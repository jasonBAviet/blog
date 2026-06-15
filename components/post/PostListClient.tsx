"use client";
import { useMemo } from "react";
import { Post } from "@/types";
import { PostCard } from "./PostCard";
import { FadeIn } from "@/components/ui/FadeIn";
import { useReadHistory } from "@/hooks/useReadHistory";

interface PostListClientProps {
  posts: Post[];
  // "unread": server already filtered to unread; clicking dims post optimistically
  // "read": server already filtered to read; all rendered as read (dimmed)
  mode?: "unread" | "read";
}

export function PostListClient({ posts, mode = "unread" }: PostListClientProps) {
  const { isRead, markAsRead, mounted } = useReadHistory();

  // For "read" mode, all posts are read — no hook state needed for visual
  // For "unread" mode, cross-reference hook state for optimistic dimming
  const enriched = useMemo(() => {
    if (mode === "read") return posts.map((p) => ({ post: p, isRead: true }));
    if (!mounted) return posts.map((p) => ({ post: p, isRead: false }));
    return posts.map((p) => ({ post: p, isRead: isRead(p.slug) }));
  }, [posts, mode, isRead, mounted]);

  return (
    <div>
      {enriched.map(({ post, isRead: read }, i) => (
        <FadeIn key={post.slug} delay={i * 0.08}>
          <div onClick={() => markAsRead(post.slug)}>
            <PostCard post={post} priority={i === 0 && !read} isRead={read} />
          </div>
        </FadeIn>
      ))}
    </div>
  );
}
