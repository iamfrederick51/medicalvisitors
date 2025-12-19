"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Componente que asegura que el perfil del usuario existe en Convex
 * Se ejecuta automáticamente cuando el usuario inicia sesión
 * Optimizado para ejecutarse solo una vez por sesión
 */
export function EnsureUserProfile({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const ensureProfile = useMutation(api.userProfiles.ensureForCurrentUser);
  const hasEnsured = useRef(false);

  useEffect(() => {
    // Solo ejecutar una vez cuando el usuario esté cargado
    if (isLoaded && user && !hasEnsured.current) {
      hasEnsured.current = true;
      // Asegurar que el perfil existe en Convex (sin await para no bloquear)
      ensureProfile().catch((error) => {
        console.error("Error ensuring user profile:", error);
        // Resetear el flag en caso de error para reintentar
        hasEnsured.current = false;
      });
    }
  }, [isLoaded, user, ensureProfile]);

  return <>{children}</>;
}

