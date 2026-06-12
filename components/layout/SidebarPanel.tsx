"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type SidebarPost = {
  slug: string;
  title: string;
  createdAt: string;
  category: string;
  categoryName?: string;
  tags?: string[];
};

type Tab = "tag" | "category" | "date";

// ── Group helpers ────────────────────────────────────────────────────────────

function groupByTag(posts: SidebarPost[]) {
  const map: Record<string, SidebarPost[]> = {};
  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      (map[tag] ??= []).push(post);
    }
  }
  return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
}

function groupByCategory(posts: SidebarPost[]) {
  const map: Record<string, SidebarPost[]> = {};
  for (const post of posts) {
    const key = post.categoryName ?? post.category;
    (map[key] ??= []).push(post);
  }
  return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
}

function groupByDate(posts: SidebarPost[]) {
  const map: Record<string, Record<string, SidebarPost[]>> = {};
  for (const post of posts) {
    const d = new Date(post.createdAt);
    const year = d.getFullYear().toString();
    const month = d.toLocaleDateString("vi-VN", { month: "long", year: undefined });
    ((map[year] ??= {})[month] ??= []).push(post);
  }
  return Object.entries(map)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([year, months]) => ({
      year,
      months: Object.entries(months),
    }));
}

// ── Collapsible section ───────────────────────────────────────────────────────

function Section({
  label,
  count,
  children,
  defaultOpen = false,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-neutral-100 dark:border-neutral-800">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
      >
        <span className="flex items-center gap-2 font-medium text-neutral-800 dark:text-neutral-200">
          <svg
            className={`h-3 w-3 shrink-0 text-neutral-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
            viewBox="0 0 6 10" fill="none" stroke="currentColor" strokeWidth="1.5"
          >
            <path d="M1 1l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {label}
        </span>
        <span className="ml-2 rounded-full bg-neutral-100 px-1.5 py-0.5 text-xs tabular-nums text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
          {count}
        </span>
      </button>
      {open && <div className="pb-1">{children}</div>}
    </div>
  );
}

// ── Post link ─────────────────────────────────────────────────────────────────

function PostLink({ post, onClose }: { post: SidebarPost; onClose: () => void }) {
  const pathname = usePathname();
  const active = pathname === `/post/${post.slug}`;
  return (
    <Link
      href={`/post/${post.slug}`}
      onClick={onClose}
      className={`block truncate px-8 py-1.5 text-xs leading-snug transition-colors hover:text-neutral-900 dark:hover:text-white ${
        active
          ? "font-medium text-neutral-900 dark:text-white"
          : "text-neutral-500 dark:text-neutral-400"
      }`}
      title={post.title}
    >
      {post.title}
    </Link>
  );
}

// ── Tab views ─────────────────────────────────────────────────────────────────

function TagView({ posts, onClose }: { posts: SidebarPost[]; onClose: () => void }) {
  const groups = groupByTag(posts);
  if (groups.length === 0)
    return <p className="px-4 py-6 text-center text-xs text-neutral-400">Chưa có tag</p>;
  return (
    <div>
      {groups.map(([tag, tagPosts], i) => (
        <Section key={tag} label={tag} count={tagPosts.length} defaultOpen={i === 0}>
          {tagPosts.map((p) => (
            <PostLink key={p.slug} post={p} onClose={onClose} />
          ))}
        </Section>
      ))}
    </div>
  );
}

function CategoryView({ posts, onClose }: { posts: SidebarPost[]; onClose: () => void }) {
  const groups = groupByCategory(posts);
  return (
    <div>
      {groups.map(([cat, catPosts], i) => (
        <Section key={cat} label={cat} count={catPosts.length} defaultOpen={i === 0}>
          {catPosts.map((p) => (
            <PostLink key={p.slug} post={p} onClose={onClose} />
          ))}
        </Section>
      ))}
    </div>
  );
}

function DateView({ posts, onClose }: { posts: SidebarPost[]; onClose: () => void }) {
  const groups = groupByDate(posts);
  return (
    <div>
      {groups.map(({ year, months }) => (
        <Section key={year} label={year} count={months.reduce((s, [, mp]) => s + mp.length, 0)} defaultOpen>
          {months.map(([month, monthPosts]) => (
            <Section key={month} label={month} count={monthPosts.length} defaultOpen={false}>
              {monthPosts.map((p) => (
                <PostLink key={p.slug} post={p} onClose={onClose} />
              ))}
            </Section>
          ))}
        </Section>
      ))}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function SidebarPanel({ posts }: { posts: SidebarPost[] }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("category");
  const close = useCallback(() => setOpen(false), []);

  const tabs: { id: Tab; label: string }[] = [
    { id: "category", label: "Chủ đề" },
    { id: "tag", label: "Tag" },
    { id: "date", label: "Ngày" },
  ];

  return (
    <>
      {/* Toggle button — fixed right side */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Mở danh sách bài viết"
        className="fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-lg border border-r-0 border-neutral-200 bg-white/90 px-1.5 py-3 shadow-sm backdrop-blur-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/90 dark:hover:bg-neutral-800"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-500 dark:text-neutral-400">
          <path d="M1 2.5h12M1 7h8M1 11.5h10" strokeLinecap="round" />
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] dark:bg-black/40"
          onClick={close}
        />
      )}

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-72 flex-col border-l border-neutral-200 bg-white shadow-xl transition-transform duration-300 ease-in-out dark:border-neutral-800 dark:bg-neutral-950 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-neutral-100 px-4 dark:border-neutral-800">
          <span className="font-serif text-sm font-semibold text-neutral-900 dark:text-white">
            Danh sách bài viết
          </span>
          <button
            onClick={close}
            aria-label="Đóng"
            className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l12 12M13 1L1 13" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 gap-1 border-b border-neutral-100 px-3 py-2 dark:border-neutral-800">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                tab === t.id
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              {t.label}
            </button>
          ))}
          <span className="ml-auto self-center text-xs text-neutral-400">{posts.length} bài</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {tab === "category" && <CategoryView posts={posts} onClose={close} />}
          {tab === "tag" && <TagView posts={posts} onClose={close} />}
          {tab === "date" && <DateView posts={posts} onClose={close} />}
        </div>
      </aside>
    </>
  );
}
