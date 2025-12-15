"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Pill, 
  LogOut,
  Stethoscope,
  Shield,
  Eye,
  ArrowLeft
} from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { signOut } = useAuthActions();
  const currentUser = useQuery(api.auth.currentUser);
  const userProfile = useQuery(api.userProfiles.getCurrentProfile);
  
  // Determinar si es admin
  const isAdmin = userProfile?.role === "admin";

  // Estado para el modo de vista del admin (admin o visitor)
  const [adminViewMode, setAdminViewMode] = useState<"admin" | "visitor">("admin");

  // Inicializar el modo de vista desde localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && isAdmin) {
      const savedMode = localStorage.getItem("adminViewMode") as "admin" | "visitor" | null;
      if (savedMode) {
        setAdminViewMode(savedMode);
      } else {
        // Por defecto, si es admin y está en una página de admin, modo admin
        // Si está en una página de visitador, modo visitor
        const isAdminPage = pathname.startsWith("/admin");
        const defaultMode = isAdminPage ? "admin" : "visitor";
        setAdminViewMode(defaultMode);
        localStorage.setItem("adminViewMode", defaultMode);
      }
    }
  }, [isAdmin, pathname]);

  // Determinar si estamos en una página de admin
  const isAdminPage = pathname.startsWith("/admin");

  // Items de navegación base
  const allNavItems = [
    { href: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/visits", label: t("nav.visits"), icon: Calendar },
    { href: "/doctors", label: t("nav.doctors"), icon: Users },
    { href: "/medications", label: t("nav.medications"), icon: Pill },
  ];

  // Lógica de navegación: si es admin en modo visitor, mostrar solo Dashboard y Visitas
  // Si es admin en modo admin, mostrar todos los items
  const navItems = isAdmin && adminViewMode === "visitor"
    ? allNavItems.filter(item => item.href === "/" || item.href === "/visits")
    : isAdmin
    ? allNavItems
    : allNavItems.filter(item => item.href === "/" || item.href === "/visits");
  
  // Si es admin en modo admin, agregar link al panel de admin
  if (isAdmin && adminViewMode === "admin") {
    navItems.push({ href: "/admin", label: "Admin", icon: Shield });
  }

  // Función para cambiar al modo visitador
  const handleViewAsGuest = () => {
    setAdminViewMode("visitor");
    if (typeof window !== "undefined") {
      localStorage.setItem("adminViewMode", "visitor");
    }
    router.push("/");
  };

  // Función para volver al modo admin
  const handleReturnToAdmin = () => {
    setAdminViewMode("admin");
    if (typeof window !== "undefined") {
      localStorage.setItem("adminViewMode", "admin");
    }
    router.push("/admin");
  };

  // Limpiar localStorage al cerrar sesión
  const handleSignOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminViewMode");
    }
    try {
      await signOut();
      window.location.href = "/login";
    } catch (error) {
      // Si falla, simplemente redirigir
      window.location.href = "/login";
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-white" />
            <span className="text-white font-bold text-lg">Medical Visitor</span>
          </div>
          <div className="flex items-center gap-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
            {/* Botón "Mirar como Huésped" - Solo visible cuando admin está en modo admin y en páginas de admin */}
            {isAdmin && adminViewMode === "admin" && isAdminPage && (
              <button
                onClick={handleViewAsGuest}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-95"
                title="Mirar como Huésped"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Mirar como Huésped</span>
              </button>
            )}
            {/* Botón "Volver al Admin" - Solo visible cuando admin está en modo visitor */}
            {isAdmin && adminViewMode === "visitor" && (
              <button
                onClick={handleReturnToAdmin}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-95"
                title="Volver al Admin"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Volver al Admin</span>
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t("nav.signOut")}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

