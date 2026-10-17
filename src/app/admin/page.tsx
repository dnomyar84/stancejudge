import { AdminSettings } from "@/components/admin-settings";
import { Suspense } from "react";

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading admin…</div>}>
      <AdminSettings />
    </Suspense>
  );
}
