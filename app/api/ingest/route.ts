import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

function authGuard(request: NextRequest): boolean {
  const expected = process.env.INGEST_API_KEY;
  if (!expected) return false;
  const auth = request.headers.get("Authorization") ?? "";
  return auth === `Bearer ${expected}`;
}

type ArticleInput = {
  title: string;
  content: string;
  summary?: string;
  category?: string;
  tags?: string[];
  sourceUrl?: string;
  coverImage?: string;
};

async function ingestOne(article: ArticleInput) {
  const { title, content, summary, category, tags, sourceUrl, coverImage } = article;
  if (!title?.trim() || !content?.trim()) {
    throw new Error("title and content are required");
  }

  const slug = slugify(title);
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) {
    return { duplicate: true, slug };
  }

  // Ensure category exists, fall back to default
  const categorySlug = category ?? "cong-nghe";
  const catExists = await prisma.category.findUnique({ where: { slug: categorySlug } });
  const resolvedCategory = catExists ? categorySlug : "cong-nghe";

  // Upsert tags as master data
  const tagNames = tags ?? [];
  if (tagNames.length) {
    await Promise.all(
      tagNames.map((name) =>
        prisma.tag.upsert({ where: { name }, update: {}, create: { name } })
      )
    );
  }

  const post = await prisma.post.create({
    data: {
      slug,
      title: title.trim(),
      content: content.trim(),
      summary: summary?.trim() ?? null,
      category: resolvedCategory,
      tagRefs: tagNames.length ? { connect: tagNames.map((name) => ({ name })) } : undefined,
      createdAt: new Date(),
      views: 0,
      source: "api",
      sourceUrl: sourceUrl ?? null,
      coverImage: coverImage ?? null,
    },
  });

  return { duplicate: false, slug: post.slug };
}

export async function POST(request: NextRequest) {
  if (!authGuard(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Batch mode
    if (Array.isArray(body.articles)) {
      const created: Array<{ slug: string; title: string }> = [];
      const skipped: Array<{ title: string; reason: string }> = [];

      for (const article of body.articles) {
        try {
          const result = await ingestOne(article as ArticleInput);
          if (result.duplicate) {
            skipped.push({ title: article.title ?? "(unknown)", reason: `Duplicate slug: ${result.slug}` });
          } else {
            created.push({ slug: result.slug!, title: article.title });
          }
        } catch (err) {
          skipped.push({ title: (article as ArticleInput).title ?? "(unknown)", reason: String(err) });
        }
      }

      if (created.length > 0) {
        revalidatePath("/", "layout");
      }

      return NextResponse.json({ success: true, count: created.length, posts: created, skipped });
    }

    // Single mode
    const result = await ingestOne(body as ArticleInput);
    if (result.duplicate) {
      return NextResponse.json(
        { success: false, error: `Duplicate slug: ${result.slug}` },
        { status: 409 }
      );
    }

    revalidatePath("/", "layout");
    return NextResponse.json({ success: true, slug: result.slug }, { status: 201 });
  } catch (err) {
    console.error("[ingest]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
