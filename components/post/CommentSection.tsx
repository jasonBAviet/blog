"use client";

import { useState, useEffect } from "react";
import { Comment } from "@/types";

export function CommentSection({ postSlug }: { postSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function loadComments() {
    try {
      const res = await fetch(`/api/comments?postSlug=${postSlug}`);
      const data = await res.json();
      setComments(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) {
      setMessage("Vui long nhap ten va noi dung.");
      return;
    }
    if (!confirm("Xac nhan gui binh luan?")) return;

    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postSlug,
          authorName: authorName.trim(),
          content: content.trim(),
        }),
      });
      if (res.ok) {
        setAuthorName("");
        setContent("");
        await loadComments();
      } else {
        setMessage("Loi khi gui binh luan.");
      }
    } catch {
      setMessage("Loi ket noi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-16 border-t border-neutral-200/60 pt-8 dark:border-neutral-800/60">
      <h2 className="mb-6 font-serif text-xl font-semibold text-neutral-900 dark:text-white">
        Binh luan ({comments.length})
      </h2>

      <form onSubmit={handleSubmit} className="mb-8 space-y-3">
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Ten cua ban"
          className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-600"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Viet binh luan..."
          rows={3}
          className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-600"
        />
        {message && (
          <p
            className={
              "text-xs " +
              (message.includes("Loi")
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400")
            }
          >
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting || !authorName.trim() || !content.trim()}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {submitting ? "Dang gui..." : "Gui binh luan"}
        </button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-neutral-400 dark:text-neutral-500">
          Chua co binh luan nao. Hay la nguoi dau tien binh luan!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-neutral-200/60 p-4 dark:border-neutral-800/60"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  {comment.authorName}
                </span>
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  {new Date(comment.createdAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
