import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/src/config/database";

const COOKIE_NAME = "blog_sid";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookieId = cookieStore.get(COOKIE_NAME)?.value;
    if (!cookieId) return NextResponse.json({ ok: false }, { status: 401 });

    const { slug } = await request.json();
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const session = await prisma.deviceSession.findUnique({
      where: { cookieId },
      select: { id: true },
    });
    if (!session) return NextResponse.json({ ok: false }, { status: 404 });

    await prisma.postReadHistory.createMany({
      data: [{ sessionId: session.id, postSlug: slug }],
      skipDuplicates: true,
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
