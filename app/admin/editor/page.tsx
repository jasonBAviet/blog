"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { CategorySelect } from "@/components/admin/CategorySelect";
import { Category, Post } from "@/types";
import { slugify } from "@/lib/utils";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setMessage("Vui long nhap tieu de va noi dung.");
      return;
    }
    if (!category) {
      setMessage("Vui long chon danh muc.");
      return;
    }

    setLoading(true);
    setMessage("");

    const slug = slugify(title);
    const post: Post = {
      slug,
      title: title.trim(),
      content,
      category,
      categoryName: categories.find((c) => c.slug === category)?.name || category,
      createdAt: new Date().toISOString(),
      views: 0,
    };

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      });
      if (res.ok) {
        router.push("/admin");
      } else {
        setMessage("Loi khi dang bai.");
      }
    } catch {
      setMessage("Loi ket noi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
        Viet bai moi
      </h1>

      <form onSubmit={handlePublish} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Tieu de
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhap tieu de bai viet..."
            className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-600"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Danh muc
          </label>
          <CategorySelect categories={categories} value={category} onChange={setCategory} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Noi dung
          </label>
          <PostEditor content={content} onChange={setContent} />
        </div>

        {message && (
          <p
            className={
              "text-xs " +
              (message.includes("Loi") || message.includes("Vui")
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400")
            }
          >
            {message}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-neutral-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {loading ? "Dang dang bai..." : "Dang bai"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded-md px-4 py-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            Huy
          </button>
        </div>
      </form>
    </div>
  );
}
