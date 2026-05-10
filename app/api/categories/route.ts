import { NextResponse } from "next/server";
import { getAllCategories, createCategory } from "@/lib/store";

export async function GET() {
  try {
    const categories = getAllCategories();
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, name, createdAt } = body;
    if (!slug || !name) {
      return NextResponse.json({ error: "Thieu slug hoac name" }, { status: 400 });
    }
    createCategory({ slug, name, createdAt: createdAt || new Date().toISOString() });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}
