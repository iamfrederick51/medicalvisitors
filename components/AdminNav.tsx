"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Shield, LayoutDashboard, Users, Pill, LogOut } from "lucide-react";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      router.push("/login");
    }
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/doctors", label: "Doctores", icon: Users },
    { href: "/admin/medications", label: "Medicamentos", icon: Pill },
    { href: "/admin/users", label: "Usuarios", icon: Users },
  ];

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 shadow-xl border-b border-indigo-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-white" />
            <span className="text-white font-bold text-xl tracking-tight">Admin Panel</span>
          </div>
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-white/20 backdrop-blur-sm text-white shadow-md"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

