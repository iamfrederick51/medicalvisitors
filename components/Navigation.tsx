"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUser, useClerk } from "@clerk/nextjs";
import { 
  LayoutDashboard, 
  Calendar, 
  LogOut,
  Stethoscope,
  Shield
} from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  
  const role = user?.publicMetadata?.role as string | undefined;

  // Items de navegación estáticos - solo Dashboard y Visitas
  const navItems = [
    { href: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/visits", label: t("nav.visits"), icon: Calendar },
  ];

  const isAdmin = role === "admin";

  // Función para cerrar sesión
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      // Si falla, simplemente redirigir
      router.push("/login");
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 shadow-xl border-b border-blue-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-2xl">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Medical Visitor</span>
          </div>
          <div className="flex items-center gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? "bg-white/20 backdrop-blur-sm text-white shadow-lg scale-105"
                      : "text-white/90 hover:bg-white/10 hover:text-white hover:shadow-md active:scale-95"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* Botón "Volver al Admin" solo para admins */}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white font-medium hover:bg-white/20 hover:shadow-lg transition-all duration-300 active:scale-95 border border-white/20"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Volver al Admin</span>
              </Link>
            )}
            
            {/* Avatar del usuario */}
            <div className="flex items-center">
              {!isLoaded ? (
                // Cargando
                <div className="w-11 h-11 rounded-full bg-white/20 animate-pulse border-2 border-white/30"></div>
              ) : user ? (
                // Mostrar avatar con datos
                <UserAvatar
                  name={user.firstName || user.fullName || undefined}
                  email={user.primaryEmailAddress?.emailAddress || undefined}
                  role={(role === "admin" ? "admin" : "visitor") as "admin" | "visitor"}
                  size="md"
                  showTooltip={true}
                />
              ) : (
                // Usuario no autenticado - mostrar avatar por defecto
                <div className="w-11 h-11 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">?</span>
                </div>
              )}
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white/90 hover:bg-white/10 hover:text-white transition-all duration-300 active:scale-95 font-medium"
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
