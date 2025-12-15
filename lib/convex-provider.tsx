"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ReactNode, useMemo } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convexClient = useMemo(() => {
    // Obtener la URL de Convex desde las variables de entorno
    // En Next.js, NEXT_PUBLIC_* está disponible en el cliente
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    
    if (!url || url.includes("placeholder")) {
      console.error("NEXT_PUBLIC_CONVEX_URL no está configurada correctamente");
      // Aún así crear el cliente para que la app no se rompa
      // pero mostrará errores cuando intente conectarse
    }
    
    const client = new ConvexReactClient(url || "http://127.0.0.1:6790");
    
    // Configurar listeners para detectar errores de conexión
    if (typeof window !== "undefined") {
      // El cliente de Convex maneja automáticamente la reconexión
      // pero podemos agregar logging aquí si es necesario
    }
    
    return client;
  }, []);

  return (
    <ConvexAuthProvider client={convexClient}>
      {children}
    </ConvexAuthProvider>
  );
}
