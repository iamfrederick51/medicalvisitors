"use client";

import { ReactNode } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function VisitorOnlyRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const userProfile = useQuery(api.userProfiles.getCurrentProfile);

  useEffect(() => {
    if (userProfile !== undefined && userProfile?.role === "visitor") {
      // Los visitadores no pueden acceder a estas páginas, redirigir al dashboard
      router.replace("/");
    }
  }, [userProfile, router]);

  // Si es visitador, no mostrar nada (se está redirigiendo)
  if (userProfile?.role === "visitor") {
    return null;
  }

  // Si es admin o undefined (cargando), mostrar contenido
  return <>{children}</>;
}

