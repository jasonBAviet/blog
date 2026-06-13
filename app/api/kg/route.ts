import { NextResponse } from "next/server";
import { prisma } from "@/src/config/database";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const thresholdParam = searchParams.get("threshold");
    const threshold = thresholdParam ? parseFloat(thresholdParam) : 0.3;

    if (isNaN(threshold) || threshold < 0 || threshold > 1) {
      return NextResponse.json(
        { error: "Tham số threshold không hợp lệ. Giá trị phải nằm trong khoảng [0.0, 1.0]." },
        { status: 400 }
      );
    }

    // 1. Lấy tất cả bài viết làm các Node trong đồ thị
    const posts = await prisma.post.findMany({
      include: {
        categoryRef: true,
        tagRefs: true,
      },
    });

    const nodes = posts.map((post) => ({
      id: post.slug,
      slug: post.slug,
      title: post.title,
      tags: post.tagRefs.map((t) => t.name),
      categoryName: post.categoryRef?.name || post.category,
      createdAt: post.createdAt.toISOString(),
      views: post.views,
    }));

    // 2. Lấy các liên kết tương quan từ DB có score >= threshold
    const relationships = await prisma.postRelationship.findMany({
      where: {
        score: {
          gte: threshold,
        },
      },
    });

    // Tránh trùng lặp link hai chiều trong đồ thị vô hướng (chỉ giữ lại 1 chiều A -> B)
    const seenLinks = new Set<string>();
    const links = relationships
      .filter((rel) => {
        const key = [rel.sourceSlug, rel.targetSlug].sort().join("-");
        if (seenLinks.has(key)) return false;
        seenLinks.add(key);
        return true;
      })
      .map((rel) => ({
        source: rel.sourceSlug,
        target: rel.targetSlug,
        weight: rel.score,
        relationType: "correlation",
        relationStrength: rel.score >= 0.7 ? "strong" : rel.score >= 0.4 ? "medium" : "weak",
        relationLabel: `Độ tương quan: ${(rel.score * 100).toFixed(0)}%`,
      }));

    return NextResponse.json({ nodes, links });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải dữ liệu đồ thị tri thức.", details: error.message },
      { status: 500 }
    );
  }
}
