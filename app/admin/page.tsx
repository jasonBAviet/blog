import { Suspense } from "react";
import { DashboardStats } from "@/components/admin/DashboardStats";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-8 font-serif text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
        Tong quan
      </h1>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white" />
          </div>
        }
      >
        <DashboardStats />
      </Suspense>
    </div>
  );
}
