import { NextResponse } from "next/server";
import { verifyPassword, setAuthCookie } from "@/src/core/utils/auth";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const valid = await verifyPassword(password);
    if (!valid) {
      return NextResponse.json({ error: "Mật khẩu không đúng" }, { status: 401 });
    }
    await setAuthCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

