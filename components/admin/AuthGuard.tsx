"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setChecking(false);
      return;
    }
    const authed = document.cookie.includes("admin_auth=true");
    if (!authed) {
      router.replace("/admin/login");
    } else {
      setChecking(false);
    }
  }, [pathname, router]);

  if (checking && pathname !== "/admin/login") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white" />
      </div>
    );
  }

  return <>{children}</>;
}
