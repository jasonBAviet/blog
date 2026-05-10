"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Tong quan" },
  { href: "/admin/editor", label: "Viet bai moi" },
  { href: "/admin/categories", label: "Danh muc" },
  { href: "/admin/comments", label: "Binh luan" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  async function handleLogout() {
    await fetch("/api/admin-logout", { method: "POST" });
    router.push("/admin/login");
  }

  if (isLogin) return null;

  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-1">
          <Link
            href="/admin"
            className="mr-4 font-sans text-sm font-semibold tracking-tight text-neutral-900 dark:text-white"
          >
            Admin
          </Link>
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

        <div className="flex items-center gap-3">
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
            Dang xuat
          </button>
        </div>
      </div>
    </header>
  );
}
