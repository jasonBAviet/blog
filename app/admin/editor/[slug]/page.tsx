"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { CategorySelect } from "@/components/admin/CategorySelect";
import { Category, Post } from "@/types";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(true);
  const [message, setMessage] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));

    fetch(`/api/posts/${slug}`)
      .then(async (r) => {
        if (!r.ok) {
          setNotFound(true);
          return;
        }
        const post: Post = await r.json();
        setTitle(post.title);
        setContent(post.content);
        setCategory(post.category);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingPost(false));
  }, [slug]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setMessage("Vui lòng nhập tiêu đề và nội dung.");
      return;
    }
    if (!category) {
      setMessage("Vui lòng chọn danh mục.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/posts/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content,
          category,
          categoryName: categories.find((c) => c.slug === category)?.name || category,
        }),
      });
      if (res.ok) {
        router.push("/admin");
      } else {
        setMessage("Lỗi khi cập nhật bài.");
      }
    } catch {
      setMessage("Lỗi kết nối.");
    } finally {
      setLoading(false);
    }
  }

  if (loadingPost) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div>
        <h1 className="mb-6 font-serif text-xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:mb-8 sm:text-2xl">
          Không tìm thấy bài viết
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Bài viết này không tồn tại.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:mb-8 sm:text-2xl">
        Sửa bài viết
      </h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Tiêu đề
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề bài viết..."
            className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-600"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Danh mục
          </label>
          <CategorySelect categories={categories} value={category} onChange={setCategory} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Nội dung
          </label>
          <PostEditor content={content} onChange={setContent} />
        </div>

        {message && (
          <p
            className={
              "text-xs " +
              (message.includes("Lỗi") || message.includes("Vui")
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
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="min-h-10 w-full rounded-md px-4 py-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white sm:w-auto"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
