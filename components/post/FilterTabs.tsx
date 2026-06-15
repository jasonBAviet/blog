import Link from "next/link";

interface FilterTabsProps {
  currentFilter: "unread" | "read";
  unreadCount: number;
  readCount: number;
}

export function FilterTabs({ currentFilter, unreadCount, readCount }: FilterTabsProps) {
  const active =
    "rounded-full px-4 py-1.5 bg-neutral-900 text-white text-sm dark:bg-white dark:text-neutral-900 transition-colors";
  const inactive =
    "rounded-full px-4 py-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors";

  return (
    <div className="mb-6 flex items-center gap-2">
      <Link href="/" className={currentFilter === "unread" ? active : inactive}>
        Chưa xem
        <span className="ml-1.5 text-xs opacity-60">({unreadCount})</span>
      </Link>
      <Link href="/?filter=read" className={currentFilter === "read" ? active : inactive}>
        Đã xem
        {readCount > 0 && (
          <span className="ml-1.5 text-xs opacity-60">({readCount})</span>
        )}
      </Link>
    </div>
  );
}
