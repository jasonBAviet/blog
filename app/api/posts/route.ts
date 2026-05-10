import { NextResponse } from "next/server";
import { getAllPosts, createPost } from "@/lib/store";

export async function GET() {
  try {
    const posts = getAllPosts();
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, title, content, category, categoryName, coverImage, images } = body;
    if (!slug || !title || !content || !category) {
      return NextResponse.json({ error: "Thieu thong tin bai viet" }, { status: 400 });
    }
    createPost({
      slug,
      title,
      content,
      category,
      categoryName: categoryName || category,
      createdAt: new Date().toISOString(),
      views: 0,
      coverImage: coverImage || undefined,
      images: images || undefined,
    });
    return NextResponse.json({ success: true, slug }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}
