import fs from "node:fs";
import path from "node:path";
import { Post } from "@/types";
import { slugify } from "@/src/core/utils/utils";

const SOURCE_DIR = path.join(process.cwd(), "Source");
const DEFAULT_CATEGORY = "suy-ngam";
const DEFAULT_CATEGORY_NAME = "Suy ngẫm";
const MD_FILE_REGEX = /^\d{2}\.\d{2}\.\d{4}\.md$/;
const IMAGE_FILE_REGEX = /^(\d{2}\.\d{2}\.\d{4})(?:\.(\d+))?\.png$/i;

function formatIsoDate(dateText: string): string {
  const [day, month, year] = dateText.split(".");
  return `${year}-${month}-${day}`;
}

function classifyByTitle(title: string): string {
  const t = (title || "").toLowerCase();
  if (t.includes('phật giáo') || t.includes('bụt') || t.includes('tuệ sỹ') || t.includes('công đức')) return 'phat-giao';
  if (t.includes('triết học')) return 'triet-hoc';
  if (t.includes('thơ') || t.includes('văn học')) return 'van-hoc';
  if (t.includes('âm nhạc') || t.includes('ẩm thực') || t.includes('world cup') || t.includes('văn hóa')) return 'van-hoa';
  if (t.includes('tâm lý') || t.includes('phụ nữ')) return 'tam-ly';
  if (t.includes('lập trình') || t.includes('code') || t.includes('terraform') || t.includes('kafka') || t.includes('azure') || t.includes('openai') || t.includes('latency') || t.includes('software development')) return 'lap-trinh';
  if (t.includes('ai') || t.includes('công nghệ') || t.includes('technology') || t.includes('tokenized') || t.includes('ev transition') || t.includes('steve jobs') || t.includes('innovation')) return 'cong-nghe';
  if (t.includes('product-market fit') || t.includes('build-or-buy') || t.includes('hướng dẫn')) return 'huong-dan';
  if (t.includes('ceo') || t.includes('chill life') || t.includes('employee')) return 'doi-song';
  return 'suy-ngam';
}

const CATEGORY_NAMES: Record<string, string> = {
  "cong-nghe": "Công nghệ",
  "doi-song": "Đời sống",
  "suy-ngam": "Suy ngẫm",
  "lap-trinh": "Lập trình",
  "phat-giao": "Phật giáo",
  "triet-hoc": "Triết học",
  "tam-ly": "Tâm lý",
  "van-hoc": "Văn học",
  "van-hoa": "Văn hóa",
  "huong-dan": "Hướng dẫn"
};

function mapCategory(categoryName: string, title?: string): { slug: string; name: string } {
  const norm = (categoryName || "").toLowerCase().trim();
  let slug = "suy-ngam";
  switch (norm) {
    case "technology": slug = "cong-nghe"; break;
    case "lifestyle": slug = "doi-song"; break;
    case "psychology": slug = "tam-ly"; break;
    case "buddhism": slug = "phat-giao"; break;
    case "philosophy": slug = "triet-hoc"; break;
    case "literature": slug = "van-hoc"; break;
    case "culture": slug = "van-hoa"; break;
    case "guide": slug = "huong-dan"; break;
    default: 
      if (title) slug = classifyByTitle(title);
      else slug = "suy-ngam";
  }
  return { slug, name: CATEGORY_NAMES[slug] || "Suy ngẫm" };
}

function parseFrontmatter(content: string): { frontmatter: Record<string, any>; body: string } {
  // Normalize line endings
  const normalized = content.replace(/\r\n/g, "\n");
  
  // Match markdown frontmatter: --- YAML --- content
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  if (!match) {
    return { frontmatter: {}, body: normalized };
  }

  const frontmatterText = match[1];
  const body = match[2].trim();
  const frontmatter: Record<string, any> = {};

  // Simple YAML parser for our use case
  frontmatterText.split("\n").forEach((line) => {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) return;

    const key = line.substring(0, colonIdx).trim();
    const value = line.substring(colonIdx + 1).trim();

    if (value.startsWith("[") && value.endsWith("]")) {
      // Parse array: ["item1", "item2"]
      frontmatter[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""));
    } else {
      // Remove quotes
      frontmatter[key] = value.replace(/^["']|["']$/g, "");
    }
  });

  return { frontmatter, body };
}

function markdownToHtml(markdown: string): string {
  let html = markdown.replace(/\r\n/g, "\n").trim();

  // Convert paragraphs (separated by blank lines)
  html = html
    .split(/\n\s*\n/)
    .map((p) => `<p>${p.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
    .join("\n\n");

  return html;
}

function parseTags(input: unknown): string[] | undefined {
  if (Array.isArray(input)) {
    const tags = input
      .map((tag) => String(tag).trim())
      .filter(Boolean);
    return tags.length > 0 ? tags : undefined;
  }

  if (typeof input === "string") {
    const tags = input
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    return tags.length > 0 ? tags : undefined;
  }

  return undefined;
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
    .filter((name) => MD_FILE_REGEX.test(name))
    .filter((name) => fs.statSync(path.join(SOURCE_DIR, name)).isFile())
    .map((filename) => {
      const filePath = path.join(SOURCE_DIR, filename);
      const rawContent = fs.readFileSync(filePath, "utf8");
      const { frontmatter, body } = parseFrontmatter(rawContent);

      // Extract date from filename (DD.MM.YYYY.md -> DD.MM.YYYY)
      const dateStr = filename.replace(".md", "");
      const images = (imageMap[dateStr] || []).map((imageName) => `/source-images/${imageName}`);

      const tags = parseTags(frontmatter.tags);

      const mapped = mapCategory(frontmatter.category, frontmatter.title || dateStr);
      return {
        slug: frontmatter.slug || slugify(dateStr),
        title: frontmatter.title || dateStr,
        content: markdownToHtml(body),
        category: mapped.slug,
        categoryName: mapped.name,
        tags,
        createdAt: frontmatter.date || formatIsoDate(dateStr),
        views: 0,
        coverImage: images[0],
        images,
      } satisfies Post;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return posts;
}

export const sourcePosts = loadSourcePosts();
