import { Post } from "@/types";
import { getAllPosts } from "@/lib/store";

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function getSnippet(content: string, query: string, maxLength = 160): string {
  const text = content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);

  if (idx === -1) return text.substring(0, maxLength) + "...";

  const start = Math.max(0, idx - 60);
  const end = Math.min(text.length, idx + query.length + 60);
  let snippet = text.substring(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";
  return snippet;
}

export interface SearchResult {
  post: Post;
  snippet: string;
  matchedInTitle: boolean;
}

export function searchPosts(query: string): SearchResult[] {
  if (!query || query.trim().length < 2) return [];

  const normalizedQuery = normalize(query.trim());
  const rawQuery = query.trim().toLowerCase();
  const posts = getAllPosts();

  return posts
    .map((post) => {
      const normalizedTitle = normalize(post.title);
      const normalizedContent = normalize(post.content);
      const lowerTitle = post.title.toLowerCase();
      const lowerContent = post.content.replace(/<[^>]*>/g, "").toLowerCase();

      const matchedInTitle =
        lowerTitle.includes(rawQuery) || normalizedTitle.includes(normalizedQuery);
      const matchedInContent =
        lowerContent.includes(rawQuery) || normalizedContent.includes(normalizedQuery);

      if (!matchedInTitle && !matchedInContent) return null;

      return {
        post,
        snippet: matchedInContent
          ? getSnippet(post.content, query)
          : "",
        matchedInTitle,
      } as SearchResult;
    })
    .filter((r): r is SearchResult => r !== null);
}

export function highlightText(text: string, query: string): string {
  if (!query || query.trim().length < 2) return text;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}
