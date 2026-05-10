"use client";

import { useState, useEffect } from "react";
import { Comment } from "@/types";

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadComments() {
    try {
      const res = await fetch("/api/comments");
      setComments(await res.json());
    } catch {
      setMessage("Loi tai binh luan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Xoa binh luan nay?")) return;
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage("");
        await loadComments();
      } else {
        setMessage("Loi xoa binh luan.");
      }
    } catch {
      setMessage("Loi ket noi.");
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
      <h1 className="mb-8 font-serif text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
        Quan ly binh luan
      </h1>

      {message && (
        <p className="mb-4 text-xs text-red-600 dark:text-red-400">{message}</p>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Chua co binh luan nao.
        </p>
      ) : (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800">
          {comments.map((comment, i) => (
            <div
              key={comment.id}
              className={
                "px-4 py-3 " +
                (i < comments.length - 1
                  ? "border-b border-neutral-100 dark:border-neutral-800/50"
                  : "")
              }
            >
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {comment.authorName}
                  </span>
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    tren bai: {comment.postSlug}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="rounded px-2 py-0.5 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Xoa
                  </button>
                </div>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
