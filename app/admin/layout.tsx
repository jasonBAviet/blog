import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 font-sans text-neutral-800 antialiased dark:bg-neutral-950 dark:text-neutral-200">
      <AdminNav />
      <div className="flex-1">
        <AuthGuard>
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
        </AuthGuard>
      </div>
    </div>
  );
}
