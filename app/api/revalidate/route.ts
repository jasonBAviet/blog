import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";

export async function POST(request: Request) {
  // Allow revalidation from localhost for development
  const host = request.headers.get("host") || "";
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
  
  if (!isLocalhost) {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  
  try {
    let paths = undefined;
    
    // Try to parse body if content-type is json
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        const body = await request.json();
        paths = body.paths;
      } catch {
        // Body parsing failed, continue without paths
      }
    }
    
    if (paths && Array.isArray(paths)) {
      for (const p of paths) {
        revalidatePath(p);
      }
    } else {
      revalidatePath("/", "layout");
      revalidatePath("/post/[slug]", "page");
      revalidatePath("/category/[slug]", "page");
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Revalidate error:", error);
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}
