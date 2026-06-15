import { NextResponse } from "next/server";
import { postRelationshipService } from "@/src/modules/post/services/post-relationship.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const thresholdParam = searchParams.get("threshold");
    const threshold = thresholdParam ? parseFloat(thresholdParam) : 0.0;

    if (isNaN(threshold) || threshold < 0 || threshold > 1) {
      return NextResponse.json(
        { error: "Tham số threshold không hợp lệ. Giá trị phải nằm trong khoảng [0.0, 1.0]." },
        { status: 400 }
      );
    }

    const relatedPosts = await postRelationshipService.getRelatedPosts(slug, threshold);
    return NextResponse.json(relatedPosts, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải bài viết liên quan.", details: error.message },
      { status: 500 }
    );
  }
}
