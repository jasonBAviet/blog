import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/config/database";
import { parseUserAgent, getGeoFromIp, getClientIp } from "@/src/core/utils/device";

const COOKIE_NAME = "blog_sid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 năm

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const existingCookieId = cookieStore.get(COOKIE_NAME)?.value;

    // Tìm session hiện có
    if (existingCookieId) {
      const session = await prisma.deviceSession.findUnique({
        where: { cookieId: existingCookieId },
        select: { readPosts: { select: { postSlug: true } } },
      });
      if (session) {
        return NextResponse.json({
          reads: session.readPosts.map((r) => r.postSlug),
        });
      }
    }

    // Tạo session mới
    const ip = getClientIp(request);
    const ua = (request.headers.get("user-agent") || "").substring(0, 512);
    const newCookieId = crypto.randomUUID();
    const { os, device, browser } = parseUserAgent(ua);
    const geo = await getGeoFromIp(ip);

    await prisma.deviceSession.create({
      data: {
        cookieId: newCookieId,
        ip: ip.substring(0, 45),
        userAgent: ua,
        os,
        device,
        browser,
        country: geo.country,
        city: geo.city,
      },
    });

    const response = NextResponse.json({ reads: [] });
    response.cookies.set(COOKIE_NAME, newCookieId, {
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (error: any) {
    return NextResponse.json({ reads: [], error: error.message }, { status: 500 });
  }
}

// Cập nhật timezone (gọi từ client sau khi có Intl.DateTimeFormat)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookieId = cookieStore.get(COOKIE_NAME)?.value;
    if (!cookieId) return NextResponse.json({ ok: false }, { status: 401 });

    const { timezone } = await request.json();
    if (typeof timezone !== "string") return NextResponse.json({ ok: false }, { status: 400 });

    await prisma.deviceSession.update({
      where: { cookieId },
      data: { timezone: timezone.substring(0, 64) },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
