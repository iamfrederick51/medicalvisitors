"use client";

import { ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";

/**
 * ProtectedRoute - Verifica autenticación
 * El middleware se encarga de los redirects
 * Este componente solo verifica y muestra UI apropiada
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  // Mostrar loading mientras Clerk carga
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  // Si no está autenticado, el middleware ya redirigió
  // Solo retornar null para no renderizar nada
  if (!isSignedIn) {
    return null;
  }

  // Si está autenticado, renderizar children
  return <>{children}</>;
}
