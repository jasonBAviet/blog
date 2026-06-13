import { NextResponse } from "next/server";
import { removeAuthCookie } from "@/src/core/utils/auth";

export async function POST() {
  try {
    await removeAuthCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

