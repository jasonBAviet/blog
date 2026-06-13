import { NextResponse } from "next/server";
import { postRelationshipService } from "@/src/modules/post/services/post-relationship.service";

export async function POST() {
  try {
    await postRelationshipService.calculateAllRelationships();
    return NextResponse.json({
      success: true,
      message: "Đã tính toán và cập nhật điểm tương quan thành công giữa tất cả các bài viết.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Lỗi khi tính toán điểm tương quan.", details: error.message },
      { status: 500 }
    );
  }
}
