import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath?: string;
}

export function Pagination({ page, totalPages, basePath = "/" }: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildHref = (p: number) => {
    if (p === 1) return basePath;
    const separator = basePath.includes("?") ? "&" : "?";
    return `${basePath}${separator}page=${p}`;
  };

  return (
    <nav className="mt-10 flex items-center justify-center gap-1 sm:mt-12">
      {page > 1 && (
        <Link
          href={buildHref(page - 1)}
          className="flex h-9 items-center rounded-lg border border-neutral-200/60 px-3 text-sm text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-800/60 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-white"
        >
          Truoc
        </Link>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          className={
            "flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors " +
            (p === page
              ? "bg-neutral-900 font-medium text-white dark:bg-white dark:text-neutral-900"
              : "border border-neutral-200/60 text-neutral-600 hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-800/60 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-white")
          }
        >
          {p}
        </Link>
      ))}

      {page < totalPages && (
        <Link
          href={buildHref(page + 1)}
          className="flex h-9 items-center rounded-lg border border-neutral-200/60 px-3 text-sm text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-800/60 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-white"
        >
          Sau
        </Link>
      )}
    </nav>
  );
}
