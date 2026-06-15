"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Post } from "@/types";
import { formatDate } from "@/src/core/utils/utils";

const INITIAL_THRESHOLD = 0.3;

interface RelatedPost extends Post {
  relationshipScore?: number;
}

interface RelatedPostsProps {
  postSlug: string;
  initialPosts: RelatedPost[];
}

export function RelatedPosts({ postSlug, initialPosts }: RelatedPostsProps) {
  const [threshold, setThreshold] = useState<number>(INITIAL_THRESHOLD);
  const [displayThreshold, setDisplayThreshold] = useState<number>(INITIAL_THRESHOLD);
  const [posts, setPosts] = useState<RelatedPost[]>(initialPosts);
  const [loading, setLoading] = useState<boolean>(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the initial fetch — initialPosts from SSR already matches threshold=0.3
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    let isMounted = true;

    async function fetchRelatedPosts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/posts/${postSlug}/related?threshold=${threshold}`);
        if (!res.ok) {
          throw new Error("Lỗi khi tải dữ liệu bài viết liên quan");
        }
        const data = await res.json();
        if (isMounted) {
          setPosts(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchRelatedPosts();

    return () => {
      isMounted = false;
    };
  }, [threshold, postSlug]);

  return (
    <div className="mt-12 border-t border-neutral-200/60 pt-8 dark:border-neutral-800/60">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-serif text-lg font-semibold text-neutral-900 dark:text-white">
            Bài viết liên quan
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Gợi ý dựa trên điểm tương quan phân cấp và danh mục chung
          </p>
        </div>

        {/* Thanh trượt điều chỉnh ngưỡng tương quan */}
        <div className="flex flex-col gap-1.5 rounded-xl border border-neutral-200/60 bg-neutral-50/50 p-3 dark:border-neutral-800/60 dark:bg-neutral-900/50 min-w-[240px]">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-neutral-500 dark:text-neutral-400">Ngưỡng tương quan tối thiểu:</span>
            <span className="text-blue-600 dark:text-blue-400">{(displayThreshold * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={displayThreshold}
            onChange={(e) => setDisplayThreshold(parseFloat(e.target.value))}
            onPointerUp={(e) => setThreshold(parseFloat((e.target as HTMLInputElement).value))}
            onMouseUp={(e) => setThreshold(parseFloat((e.target as HTMLInputElement).value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 dark:bg-neutral-700 accent-blue-600 dark:accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 dark:text-neutral-500">
            <span>Tất cả (0%)</span>
            <span>Tương quan mạnh (70%+)</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-20 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-blue-600 dark:border-neutral-700 dark:border-t-blue-400" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 p-6 text-center dark:border-neutral-800">
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            Không có bài viết nào đạt ngưỡng tương quan này. Hãy thử kéo thanh trượt sang trái.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/post/${post.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-neutral-200/60 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/10 dark:border-neutral-800/60 dark:hover:border-blue-900/20"
            >
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    {post.category}
                  </span>
                  {post.relationshipScore !== undefined && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      {(post.relationshipScore * 100).toFixed(0)}% tương quan
                    </span>
                  )}
                </div>
                <h4 className="mb-2 line-clamp-2 font-serif text-sm font-medium text-neutral-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  {post.title}
                </h4>
              </div>
              <p className="mt-2 text-[10px] text-neutral-400 dark:text-neutral-500">
                {formatDate(post.createdAt)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
