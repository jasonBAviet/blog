import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200/60 dark:border-neutral-800/60">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-8 text-sm text-neutral-400 dark:text-neutral-600">
        <p>Blog ca nhan</p>
        <Link
          href="/admin/login"
          className="transition-colors hover:text-neutral-600 dark:hover:text-neutral-400"
        >
          Quan tri
        </Link>
      </div>
    </footer>
  );
}
