"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { CategorySelect } from "@/components/admin/CategorySelect";
import { Category, Post } from "@/types";
import { slugify } from "@/src/core/utils/utils";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
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
    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const post: Post = {
      slug,
      title: title.trim(),
      content,
      category,
      categoryName: categories.find((c) => c.slug === category)?.name || category,
      tags: parsedTags.length > 0 ? parsedTags : undefined,
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
      <h1 className="mb-6 font-serif text-xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:mb-8 sm:text-2xl">
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
            Tags (cach nhau boi dau phay)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="vi du: Phat giao, Triet hoc, Thien"
            className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-600"
          />
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

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <button
            type="submit"
            disabled={loading}
            className="min-h-10 w-full rounded-md bg-neutral-900 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 sm:w-auto"
          >
            {loading ? "Dang dang bai..." : "Dang bai"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="min-h-10 w-full rounded-md px-4 py-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white sm:w-auto"
          >
            Huy
          </button>
        </div>
      </form>
    </div>
  );
}

