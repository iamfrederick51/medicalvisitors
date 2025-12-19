"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Componente de respaldo que verifica el rol del usuario en todas las rutas
 * y redirige automáticamente si detecta una inconsistencia.
 * 
 * Actúa como red de seguridad si /post-login falla o si el usuario
 * navega directamente a una ruta incorrecta.
 */
export function RoleRedirect() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [hasChecked, setHasChecked] = useState(false);

  // Consultar Convex para obtener el rol
  const dbUser = useQuery(
    api.userProfiles.getByUserId,
    user?.id ? { userId: user.id } : "skip"
  );

  useEffect(() => {
    // Solo verificar en rutas que requieren autenticación
    const publicRoutes = ["/login", "/sign-in", "/sign-up", "/post-login"];
    if (publicRoutes.includes(pathname)) {
      return;
    }

    // Esperar a que Clerk y Convex carguen
    if (!isLoaded || !user) {
      return;
    }

    // Esperar a que Convex responda (o timeout después de 2 segundos)
    if (dbUser === undefined) {
      return;
    }

    // Prevenir múltiples verificaciones
    if (hasChecked) {
      return;
    }

    setHasChecked(true);

    // Determinar el rol (prioridad: Convex > Clerk)
    let role: string | undefined = undefined;
    
    if (dbUser?.role) {
      role = dbUser.role;
      console.log("[RoleRedirect] Role from Convex:", role);
    } else {
      role = user.publicMetadata?.role as string | undefined;
      console.log("[RoleRedirect] Role from Clerk (fallback):", role);
    }

    const isAdmin = role === "admin";
    const isOnAdminRoute = pathname.startsWith("/admin");
    const isOnDashboard = pathname === "/";

    console.log("[RoleRedirect] === Verificación de rol ===");
    console.log("[RoleRedirect] Pathname:", pathname);
    console.log("[RoleRedirect] Role:", role);
    console.log("[RoleRedirect] Is Admin:", isAdmin);
    console.log("[RoleRedirect] Is on Admin Route:", isOnAdminRoute);
    console.log("[RoleRedirect] Is on Dashboard:", isOnDashboard);

    // Si es admin y está en dashboard → redirigir a /admin
    if (isAdmin && isOnDashboard) {
      console.log("[RoleRedirect] ⚠️ Admin detected on dashboard - Redirecting to /admin");
      router.replace("/admin");
      return;
    }

    // Si NO es admin y está en /admin → redirigir a /
    if (!isAdmin && isOnAdminRoute) {
      console.log("[RoleRedirect] ⚠️ Non-admin detected on /admin - Redirecting to /");
      router.replace("/");
      return;
    }

    console.log("[RoleRedirect] ✅ Route access is correct");
  }, [isLoaded, user, dbUser, pathname, router, hasChecked]);

  // Este componente no renderiza nada
  return null;
}

