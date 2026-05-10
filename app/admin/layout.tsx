import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="bg-neutral-50 font-sans text-neutral-800 antialiased dark:bg-neutral-950 dark:text-neutral-200">
        <div className="flex min-h-screen flex-col">
          <AdminNav />
          <main className="flex-1">
            <AuthGuard>
              <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
            </AuthGuard>
          </main>
        </div>
      </body>
    </html>
  );
}
