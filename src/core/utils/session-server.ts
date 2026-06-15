import { cookies } from "next/headers";
import { prisma } from "@/src/config/database";

export async function getReadSlugsForSession(): Promise<string[]> {
  try {
    const cookieStore = await cookies();
    const cookieId = cookieStore.get("blog_sid")?.value;
    if (!cookieId) return [];
    const session = await prisma.deviceSession.findUnique({
      where: { cookieId },
      select: { readPosts: { select: { postSlug: true } } },
    });
    return session?.readPosts.map((r) => r.postSlug) ?? [];
  } catch {
    return [];
  }
}
