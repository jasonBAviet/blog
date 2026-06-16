import Link from "next/link";
import { PostListClient } from "@/components/post/PostListClient";
import { FilterTabs } from "@/components/post/FilterTabs";
import { FadeIn } from "@/components/ui/FadeIn";
import { Pagination } from "@/components/ui/Pagination";
import { KnowledgeGraph } from "@/components/kg/KnowledgeGraph";
import {
  getAllPosts,
  getPaginatedUnreadPosts,
  getReadPosts,
  getUnreadCount,
} from "@/src/core/utils/store";
import { getReadSlugsForSession } from "@/src/core/utils/session-server";

export const dynamic = "force-dynamic";

const POSTS_PER_PAGE = 10;

interface PageProps {
  searchParams: Promise<{ page?: string; view?: string; filter?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { page: pageParam, view, filter: filterParam } = await searchParams;

  const currentView = view === "kg" ? "kg" : "list";
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10) || 1);
  const isReadFilter = filterParam === "read";
  const currentFilter = isReadFilter ? "read" : "unread";

  // Read session từ cookie để biết bài nào đã xem
  const readSlugs = await getReadSlugsForSession();
  const readCount = readSlugs.length;

  const viewSwitcher = (
    <div className="inline-flex rounded-full border border-neutral-200/70 bg-white p-1 text-sm shadow-sm dark:border-neutral-800/70 dark:bg-neutral-950">
      <Link
        href="/"
        className={
          "rounded-full px-4 py-2 transition-colors " +
          (currentView === "list"
            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
            : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white")
        }
      >
        Danh sách
      </Link>
      <Link
        href="/?view=kg"
        className={
          "rounded-full px-4 py-2 transition-colors " +
          (currentView === "kg"
            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
            : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white")
        }
      >
        Knowledge Graph
      </Link>
    </div>
  );

  const pageHeader = (
    <div className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="mb-2 font-serif text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:mb-3 sm:text-3xl">
          Blog cá nhân
        </h1>
        <p className="max-w-md font-serif text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-base">
          Nơi chia sẻ về công nghệ, đời sống và những suy ngẫm.
        </p>
      </div>
      {viewSwitcher}
    </div>
  );

  // ── KG view ──────────────────────────────────────────────────────────────
  if (currentView === "kg") {
    const allPosts = await getAllPosts();
    return (
      <div className="px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
        <div className="mx-auto mb-6 flex max-w-3xl flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mb-2 font-serif text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:mb-3 sm:text-3xl">
              Blog cá nhân
            </h1>
            <p className="max-w-md font-serif text-sm leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-base">
              Nơi chia sẻ về công nghệ, đời sống và những suy ngẫm.
            </p>
          </div>
          {viewSwitcher}
        </div>
        <FadeIn>
          <KnowledgeGraph posts={allPosts} />
        </FadeIn>
      </div>
    );
  }

  // ── Filter: Đã xem ────────────────────────────────────────────────────────
  if (isReadFilter) {
    const readPosts = await getReadPosts(readSlugs);
    const unreadCount = await getUnreadCount(readSlugs);
    return (
      <div className="mx-auto max-w-3xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
        {pageHeader}
        <FilterTabs
          currentFilter="read"
          unreadCount={unreadCount}
          readCount={readCount}
        />
        {readPosts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200/60 py-12 text-center dark:border-neutral-800/60">
            <p className="font-serif text-sm text-neutral-400 dark:text-neutral-500">
              Bạn chưa đọc bài nào. Hãy khám phá danh sách bên dưới!
            </p>
            <Link
              href="/"
              className="mt-4 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              Xem bài chưa đọc →
            </Link>
          </div>
        ) : (
          <PostListClient posts={readPosts} mode="read" />
        )}
      </div>
    );
  }

  // ── Filter: Chưa xem (default) ────────────────────────────────────────────
  // Pages 1..N = unread, page N+1 = read posts (trang cuối)
  const { posts: unreadPosts, total: unreadTotal, page, totalUnreadPages } =
    await getPaginatedUnreadPosts(currentPage, POSTS_PER_PAGE, readSlugs);

  const totalPages = readCount > 0 ? totalUnreadPages + 1 : totalUnreadPages;
  const isReadPage = readCount > 0 && currentPage > totalUnreadPages;

  // Nếu người dùng điều hướng đến trang cuối (trang đã đọc)
  if (isReadPage) {
    const readPosts = await getReadPosts(readSlugs);
    return (
      <div className="mx-auto max-w-3xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
        {pageHeader}
        <FilterTabs
          currentFilter="unread"
          unreadCount={unreadTotal}
          readCount={readCount}
        />
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200/60 dark:bg-neutral-800/60" />
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Trang cuối · Bài đã đọc
          </span>
          <div className="h-px flex-1 bg-neutral-200/60 dark:bg-neutral-800/60" />
        </div>
        <PostListClient posts={readPosts} mode="read" />
        <Pagination page={totalPages} totalPages={totalPages} basePath="/" />
      </div>
    );
  }

  // Trang bình thường (unread)
  return (
    <div className="mx-auto max-w-3xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
      {pageHeader}
      <FilterTabs
        currentFilter="unread"
        unreadCount={unreadTotal}
        readCount={readCount}
      />
      <PostListClient posts={unreadPosts} mode="unread" />
      <Pagination page={page} totalPages={totalPages} basePath="/" />
    </div>
  );
}
