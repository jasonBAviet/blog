import Link from "next/link";
import { getStats } from "@/lib/store";

export function DashboardStats() {
  const stats = getStats();

  const cards = [
    { label: "Tổng bài viết", value: stats.totalPosts },
    { label: "Tổng lượt xem", value: stats.totalViews },
    { label: "Tổng bình luận", value: stats.totalComments },
    { label: "Danh mục", value: stats.totalCategories },
  ];

  return (
    <div>
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <p className="mb-1 text-xs text-neutral-400 dark:text-neutral-500">{card.label}</p>
            <p className="font-sans text-2xl font-semibold tabular-nums text-neutral-900 dark:text-white">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {stats.recentPosts.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-3 font-sans text-sm font-medium text-neutral-900 dark:text-white">
            Bài viết gần đây
          </h3>
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
            {stats.recentPosts.map((post, i) => (
              <div
                key={post.slug}
                className={
                  "flex flex-col items-start justify-between gap-2 px-4 py-3 sm:flex-row sm:items-center " +
                  (i < stats.recentPosts.length - 1
                    ? "border-b border-neutral-100 dark:border-neutral-800/50"
                    : "")
                }
              >
                <div>
                  <p className="text-sm text-neutral-800 dark:text-neutral-200">
                    {post.title}
                  </p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    {post.categoryName || post.category}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    {post.views} views
                  </span>
                  <Link
                    href={`/admin/editor/${post.slug}`}
                    className="rounded px-2 py-0.5 text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Sửa
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.topPosts.length > 0 && (
        <div>
          <h3 className="mb-3 font-sans text-sm font-medium text-neutral-900 dark:text-white">
            Xem nhiều nhất
          </h3>
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
            {stats.topPosts.map((post, i) => (
              <div
                key={post.slug}
                className={
                  "flex flex-col items-start justify-between gap-2 px-4 py-3 sm:flex-row sm:items-center " +
                  (i < stats.topPosts.length - 1
                    ? "border-b border-neutral-100 dark:border-neutral-800/50"
                    : "")
                }
              >
                <div>
                  <p className="text-sm text-neutral-800 dark:text-neutral-200">
                    {post.title}
                  </p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    {post.categoryName || post.category}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    {post.views} views
                  </span>
                  <Link
                    href={`/admin/editor/${post.slug}`}
                    className="rounded px-2 py-0.5 text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Sửa
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
