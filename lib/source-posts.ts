import fs from "node:fs";
import path from "node:path";
import { Post } from "@/types";
import { slugify } from "@/lib/utils";

const SOURCE_DIR = path.join(process.cwd(), "Source");
const DEFAULT_CATEGORY = "suy-ngam";
const DEFAULT_CATEGORY_NAME = "Suy ngam";
const DATE_FILE_REGEX = /^\d{2}\.\d{2}\.\d{4}$/;
const IMAGE_FILE_REGEX = /^(\d{2}\.\d{2}\.\d{4})(?:\.(\d+))?\.png$/i;

function formatIsoDate(dateText: string): string {
  const [day, month, year] = dateText.split(".");
  return `${year}-${month}-${day}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function textToHtml(text: string): string {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "<p></p>";

  return normalized
    .split(/\n\s*\n/g)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("\n\n");
}

function getImageMap(files: string[]): Record<string, string[]> {
  const imageMap: Record<string, string[]> = {};

  files.forEach((name) => {
    const match = name.match(IMAGE_FILE_REGEX);
    if (!match) return;

    const dateKey = match[1];
    imageMap[dateKey] = imageMap[dateKey] || [];
    imageMap[dateKey].push(name);
  });

  Object.values(imageMap).forEach((images) => {
    images.sort((a, b) => {
      const aMatch = a.match(IMAGE_FILE_REGEX);
      const bMatch = b.match(IMAGE_FILE_REGEX);
      const aOrder = Number(aMatch?.[2] || "1");
      const bOrder = Number(bMatch?.[2] || "1");
      return aOrder - bOrder;
    });
  });

  return imageMap;
}

function loadSourcePosts(): Post[] {
  if (!fs.existsSync(SOURCE_DIR)) return [];

  const entries = fs.readdirSync(SOURCE_DIR);
  const imageMap = getImageMap(entries);

  const posts = entries
    .filter((name) => DATE_FILE_REGEX.test(name))
    .filter((name) => fs.statSync(path.join(SOURCE_DIR, name)).isFile())
    .map((dateTitle) => {
      const filePath = path.join(SOURCE_DIR, dateTitle);
      const rawText = fs.readFileSync(filePath, "utf8");
      const images = (imageMap[dateTitle] || []).map((imageName) => `/source-images/${imageName}`);

      return {
        slug: slugify(dateTitle),
        title: dateTitle,
        content: textToHtml(rawText),
        category: DEFAULT_CATEGORY,
        categoryName: DEFAULT_CATEGORY_NAME,
        createdAt: formatIsoDate(dateTitle),
        views: 0,
        coverImage: images[0],
        images,
      } satisfies Post;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return posts;
}

export const sourcePosts = loadSourcePosts();
