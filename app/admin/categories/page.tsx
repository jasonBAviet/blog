"use client";

import { useState, useEffect } from "react";
import { Category } from "@/types";
import { slugify } from "@/src/core/utils/utils";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [message, setMessage] = useState("");

  async function loadCategories() {
    try {
      const res = await fetch("/api/categories");
      setCategories(await res.json());
    } catch {
      setMessage("Lỗi tải danh mục.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slugify(newName),
          name: newName.trim(),
          createdAt: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setNewName("");
        setMessage("");
        await loadCategories();
      } else {
        setMessage("Lỗi tạo danh mục.");
      }
    } catch {
      setMessage("Lỗi kết nối.");
    }
  }

  async function handleUpdate(slug: string) {
    if (!editName.trim()) return;
    try {
      const res = await fetch(`/api/categories/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (res.ok) {
        setEditingSlug(null);
        setMessage("");
        await loadCategories();
      } else {
        setMessage("Lỗi cập nhật danh mục.");
      }
    } catch {
      setMessage("Lỗi kết nối.");
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm("Xóa danh mục này?")) return;
    try {
      const res = await fetch(`/api/categories/${slug}`, { method: "DELETE" });
      if (res.ok) {
        setMessage("");
        await loadCategories();
      } else {
        setMessage("Lỗi xóa danh mục.");
      }
    } catch {
      setMessage("Lỗi kết nối.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-serif text-xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:mb-8 sm:text-2xl">
        Quản lý danh mục
      </h1>

      <div className="mb-8 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <form onSubmit={handleCreate} className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Tên danh mục mới..."
            className="flex-1 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-600"
          />
          <button
            type="submit"
            disabled={!newName.trim()}
            className="min-h-10 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Thêm
          </button>
        </form>
      </div>

      {message && (
        <p className="mb-4 text-xs text-red-600 dark:text-red-400">{message}</p>
      )}

      {categories.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Chưa có danh mục nào.
        </p>
      ) : (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
          {categories.map((cat, i) => (
            <div
              key={cat.slug}
              className={
                "flex flex-col items-start justify-between gap-2 px-4 py-3 sm:flex-row sm:items-center " +
                (i < categories.length - 1
                  ? "border-b border-neutral-100 dark:border-neutral-800/50"
                  : "")
              }
            >
              {editingSlug === cat.slug ? (
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                    className="flex-1 rounded border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                  <button
                    onClick={() => handleUpdate(cat.slug)}
                    className="min-h-9 rounded px-2 py-1 text-xs text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setEditingSlug(null)}
                    className="min-h-9 rounded px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-neutral-800 dark:text-neutral-200">
                      {cat.name}
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                      /{cat.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 self-start sm:self-auto">
                    <button
                      onClick={() => {
                        setEditingSlug(cat.slug);
                        setEditName(cat.name);
                      }}
                      className="min-h-9 rounded px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(cat.slug)}
                      className="min-h-9 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Xóa
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

