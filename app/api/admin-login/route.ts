import { NextResponse } from "next/server";
import { verifyPassword, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const valid = await verifyPassword(password);
    if (!valid) {
      return NextResponse.json({ error: "Mat khau khong dung" }, { status: 401 });
    }
    await setAuthCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}
