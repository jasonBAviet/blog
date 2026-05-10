"use client";

import { Category } from "@/types";
import { useState, useEffect } from "react";

interface CategorySelectProps {
  categories: Category[];
  value: string;
  onChange: (slug: string) => void;
}

export function CategorySelect({ categories, value, onChange }: CategorySelectProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <select className="min-h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white" disabled>
        <option>Đang tải...</option>
      </select>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-600"
    >
      <option value="">Chọn danh mục</option>
      {categories.map((cat) => (
        <option key={cat.slug} value={cat.slug}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}
