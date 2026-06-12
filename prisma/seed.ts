import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import path from "node:path";
import fs from "node:fs";
import { config } from "dotenv";

config({ path: path.join(process.cwd(), ".env.local") });

const schema = process.env.BLOG_DB_SCHEMA ?? "public";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool, { schema });
const prisma = new PrismaClient({ adapter });

const mockCategories = [
  { slug: "cong-nghe", name: "Công nghệ", createdAt: "2026-01-01" },
  { slug: "doi-song", name: "Đời sống", createdAt: "2026-01-01" },
  { slug: "suy-ngam", name: "Suy ngẫm", createdAt: "2026-01-01" },
  { slug: "lap-trinh", name: "Lập trình", createdAt: "2026-01-01" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const normalized = content.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: normalized };
  const frontmatterText = match[1];
  const body = match[2].trim();
  const frontmatter: Record<string, unknown> = {};
  for (const line of frontmatterText.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (value.startsWith("[")) {
      try {
        frontmatter[key] = JSON.parse(value.replace(/'/g, '"'));
      } catch {
        frontmatter[key] = value.slice(1, -1).split(",").map((s) => s.trim().replace(/['"]/g, ""));
      }
    } else {
      frontmatter[key] = value.replace(/^['"]|['"]$/g, "");
    }
  }
  return { frontmatter, body };
}

function mdToHtml(md: string): string {
  return md
    .split(/\n\n+/)
    .map((block) => {
      if (block.startsWith("# ")) return `<h1>${block.slice(2)}</h1>`;
      if (block.startsWith("## ")) return `<h2>${block.slice(3)}</h2>`;
      if (block.startsWith("### ")) return `<h3>${block.slice(4)}</h3>`;
      return `<p>${block.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");
}

function loadSourcePosts() {
  const SOURCE_DIR = path.join(process.cwd(), "Source");
  if (!fs.existsSync(SOURCE_DIR)) return [];
  const MD_FILE_REGEX = /^\d{2}\.\d{2}\.\d{4}\.md$/;
  const IMAGE_FILE_REGEX = /^(\d{2}\.\d{2}\.\d{4})(?:\.(\d+))?\.png$/i;

  const imageMap = new Map<string, string[]>();
  try {
    const publicImages = path.join(process.cwd(), "public", "source-images");
    if (fs.existsSync(publicImages)) {
      for (const file of fs.readdirSync(publicImages)) {
        const m = file.match(IMAGE_FILE_REGEX);
        if (m) {
          const key = m[1];
          const list = imageMap.get(key) ?? [];
          list.push(`/source-images/${file}`);
          imageMap.set(key, list);
        }
      }
    }
  } catch {}

  const posts = [];
  for (const file of fs.readdirSync(SOURCE_DIR).sort().reverse()) {
    if (!MD_FILE_REGEX.test(file)) continue;
    try {
      const dateStr = file.replace(".md", "");
      const [day, month, year] = dateStr.split(".");
      const isoDate = `${year}-${month}-${day}`;
      const raw = fs.readFileSync(path.join(SOURCE_DIR, file), "utf-8");
      const { frontmatter, body } = parseFrontmatter(raw);
      const images = imageMap.get(dateStr) ?? [];
      const coverImage = images[0];
      const extraImages = images.slice(1);
      posts.push({
        slug: (frontmatter.slug as string) || slugify(dateStr),
        title: (frontmatter.title as string) || dateStr,
        content: mdToHtml(body),
        category: (frontmatter.category as string) || "suy-ngam",
        tags: Array.isArray(frontmatter.tags) ? (frontmatter.tags as string[]) : [],
        createdAt: isoDate,
        coverImage,
        images: extraImages.length ? extraImages : undefined,
      });
    } catch {}
  }
  return posts;
}

async function main() {
  // 1. Seed categories
  console.log("Seeding categories...");
  for (const cat of mockCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { slug: cat.slug, name: cat.name, createdAt: new Date(cat.createdAt) },
    });
  }
  console.log(`✓ ${mockCategories.length} categories`);

  // 2. Load posts from source files
  const validCategorySlugs = new Set(mockCategories.map((c) => c.slug));
  const sourcePosts = loadSourcePosts();

  // 3. Collect & seed all unique tags as master data
  console.log("Seeding tags...");
  const allTagNames = new Set<string>();
  for (const post of sourcePosts) {
    for (const t of post.tags) allTagNames.add(t);
  }
  for (const name of allTagNames) {
    await prisma.tag.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log(`✓ ${allTagNames.size} tags`);

  // 4. Seed posts + connect tags
  console.log("Seeding posts...");
  let seeded = 0;
  for (const post of sourcePosts) {
    const category = validCategorySlugs.has(post.category) ? post.category : "suy-ngam";
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {
        tagRefs: post.tags.length
          ? { set: post.tags.map((name) => ({ name })) }
          : { set: [] },
      },
      create: {
        slug: post.slug,
        title: post.title,
        content: post.content,
        category,
        createdAt: new Date(post.createdAt),
        views: 0,
        coverImage: post.coverImage ?? null,
        images: post.images ? JSON.stringify(post.images) : null,
        source: "markdown",
        tagRefs: post.tags.length ? { connect: post.tags.map((name) => ({ name })) } : undefined,
      },
    });
    seeded++;
  }
  console.log(`✓ ${seeded} posts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
