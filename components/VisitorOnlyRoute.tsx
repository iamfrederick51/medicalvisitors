"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export function VisitorOnlyRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isLoaded, user } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    const role = user?.publicMetadata?.role as string | undefined;
    if (role === "visitor" || !role) {
      // Los visitadores no pueden acceder a estas páginas, redirigir al dashboard
      router.replace("/");
    }
  }, [user, isLoaded, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  const role = user?.publicMetadata?.role as string | undefined;
  // Si es visitador o no tiene rol, no mostrar nada (se está redirigiendo)
  if (role === "visitor" || !role) {
    return null;
  }

  // Si es admin, mostrar contenido
  return <>{children}</>;
}
