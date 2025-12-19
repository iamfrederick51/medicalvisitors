import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { AdminNav } from "@/components/AdminNav";
import { AdminLayoutClient } from "@/components/AdminLayoutClient";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  const role = (user.publicMetadata as { role?: string })?.role;

  if (role !== "admin") {
    redirect("/");
  }

  return (
    <AdminLayoutClient>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <AdminNav />
        {children}
      </div>
    </AdminLayoutClient>
  );
}
