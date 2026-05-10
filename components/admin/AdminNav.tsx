"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/editor", label: "Viết bài mới" },
  { href: "/admin/categories", label: "Danh mục" },
  { href: "/admin/comments", label: "Bình luận" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/admin-logout", { method: "POST" });
    router.push("/admin/login");
  }

  if (isLogin) return null;

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-1">
          <Link
            href="/admin"
            className="mr-2 font-sans text-sm font-semibold tracking-tight text-neutral-900 dark:text-white sm:mr-4"
          >
            Admin
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "rounded px-2 py-1 text-xs transition-colors " +
                  (pathname === item.href
                    ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white")
                }
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/"
            target="_blank"
            className="text-xs text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
          >
            Xem blog
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs text-neutral-400 transition-colors hover:text-red-600 dark:text-neutral-500 dark:hover:text-red-400"
          >
            Đăng xuất
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 md:hidden"
          aria-label="Mo menu admin"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 11-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M2 3.75A.75.75 0 012.75 3h10.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zm0 4A.75.75 0 012.75 7h10.5a.75.75 0 010 1.5H2.75A.75.75 0 012 7.75zm.75 4a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H2.75z" />
            </svg>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-neutral-200 px-4 py-3 dark:border-neutral-800 md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "inline-flex min-h-10 items-center rounded px-3 text-sm transition-colors " +
                  (pathname === item.href
                    ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white")
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex min-h-10 items-center rounded px-3 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              Xem blog
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex min-h-10 items-center rounded px-3 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
