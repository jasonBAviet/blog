import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200/60 dark:border-neutral-800/60">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-2 px-4 py-6 text-sm text-neutral-400 dark:text-neutral-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-8">
        <p>Blog cá nhân</p>
        <Link
          href="/admin/login"
          className="inline-flex min-h-10 items-center transition-colors hover:text-neutral-600 dark:hover:text-neutral-400 sm:min-h-0"
        >
          Quản trị
        </Link>
      </div>
    </footer>
  );
}
