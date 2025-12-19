"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";
import { ReactNode, useMemo, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

/**
 * Valida que una URL sea una URL absoluta válida
 */
function isValidAbsoluteUrl(url: string | undefined): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }
  
  const trimmedUrl = url.trim();
  
  // Debe ser una cadena no vacía
  if (trimmedUrl === "") {
    return false;
  }
  
  // No debe contener placeholders
  if (trimmedUrl.includes("placeholder")) {
    return false;
  }
  
  // Debe empezar con http:// o https://
  if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
    return false;
  }
  
  // Intentar crear un objeto URL para validar el formato
  try {
    new URL(trimmedUrl);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convex local dev runs the API at :3210 and the dashboard at :6790.
 * If the user accidentally configures the dashboard URL, treat it as invalid.
 */
function looksLikeLocalConvexDashboard(url: string): boolean {
  try {
    const u = new URL(url.trim());
    const isLocalHost = u.hostname === "127.0.0.1" || u.hostname === "localhost";
    return isLocalHost && u.port === "6790";
  } catch {
    return false;
  }
}

/**
 * Extrae el issuer URL del token JWT de Clerk
 * Los tokens JWT tienen el formato: header.payload.signature
 * El payload contiene el campo "iss" con el issuer URL
 */
function extractIssuerFromToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decodificar el payload (base64url)
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(decoded);
    
    // El issuer está en el campo "iss"
    if (parsed.iss && typeof parsed.iss === 'string') {
      return parsed.iss;
    }
  } catch (error) {
    // Si falla, no es crítico
    console.log("[ConvexProvider] Could not extract issuer from token:", error);
  }
  return null;
}

/**
 * Obtiene la URL de Convex desde las variables de entorno o usa un fallback
 * 
 * Para desarrollo local:
 * - Ejecuta `npx convex dev` para generar automáticamente .env.local
 * - La URL será: http://127.0.0.1:3210
 * 
 * Para producción:
 * - Obtén la URL desde el dashboard de Convex (Settings → Deployment URL)
 * - Crea .env.local en la raíz del proyecto con:
 *   NEXT_PUBLIC_CONVEX_URL=https://tu-proyecto.convex.cloud
 * - Reinicia el servidor de Next.js después de crear/actualizar .env.local
 */
function getConvexUrl(): string {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  
  // Validar que la URL sea válida
  if (isValidAbsoluteUrl(url) && !looksLikeLocalConvexDashboard(url!)) {
    return url!.trim();
  }
  
  // Si no hay URL válida, mostrar error y usar fallback para desarrollo local
  if (typeof window !== "undefined") {
    if (url && looksLikeLocalConvexDashboard(url)) {
      console.error(
        "⚠️ NEXT_PUBLIC_CONVEX_URL apunta al dashboard local de Convex (:6790), no al API.\n" +
          "Usa el API URL que imprime `npx convex dev`, normalmente: http://127.0.0.1:3210"
      );
    }
    console.error(
      "⚠️ NEXT_PUBLIC_CONVEX_URL no está configurada correctamente.\n" +
      "Para desarrollo local, ejecuta: npx convex dev\n" +
      "Para producción, crea .env.local con: NEXT_PUBLIC_CONVEX_URL=https://tu-proyecto.convex.cloud"
    );
  }
  
  // Fallback para desarrollo local (solo si no hay URL válida)
  return "http://127.0.0.1:3210";
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // Obtener el estado de autenticación de Clerk
  const { getToken, isLoaded, userId } = useAuth();
  
  // SIEMPRE inicializar ConvexProvider, incluso si Clerk no está cargado
  // Esto previene errores de "Could not find Convex client"
  // El cliente funcionará sin autenticación inicialmente y se actualizará cuando Clerk esté listo

  // Intentar extraer y configurar el issuer URL automáticamente (solo si hay sesión)
  useEffect(() => {
    async function trySetIssuerUrl() {
      // Solo intentar si Clerk está cargado y hay una sesión válida
      if (!isLoaded || !userId) return;
      
      try {
        const token = await getToken();
        if (token) {
          const issuerUrl = extractIssuerFromToken(token);
          if (issuerUrl && !process.env.CLERK_ISSUER_URL) {
            console.log(`[ConvexProvider] Extracted issuer URL from token: ${issuerUrl}`);
            console.log(`[ConvexProvider] To configure permanently, run: npx convex env set CLERK_ISSUER_URL "${issuerUrl}"`);
          }
        }
      } catch (error) {
        // No crítico, solo intentamos extraer el issuer
      }
    }
    trySetIssuerUrl();
  }, [getToken, userId, isLoaded]);
  
  // SIEMPRE inicializar cliente de Convex (incluso si Clerk no está cargado)
  // El cliente puede funcionar sin autenticación inicialmente
  // y se actualizará automáticamente cuando Clerk esté listo
  const convexClient = useMemo(() => {
    try {
      const url = getConvexUrl();
      
      // Asegurar que siempre pasamos una URL absoluta válida
      if (!isValidAbsoluteUrl(url)) {
        console.error(
          "❌ URL de Convex inválida. No se puede inicializar el cliente.\n" +
          `URL recibida: ${url}\n` +
          "Por favor, configura NEXT_PUBLIC_CONVEX_URL correctamente."
        );
      }
      
      // Configurar el cliente de Convex para usar el token de Clerk
      // El cliente funcionará sin token inicialmente y se actualizará cuando Clerk esté listo
      const client = new ConvexReactClient(url, {
        // Pasar el token de Clerk a Convex para autenticación
        fetchAuthToken: async () => {
          // Si Clerk no está cargado o no hay userId, retornar undefined (sin autenticación)
          // El cliente funcionará en modo no autenticado hasta que haya token
          if (!isLoaded || !userId) {
            return undefined;
          }
          
          try {
            // Intentar obtener token con template "convex"
            const token = await getToken({ template: "convex" });
            if (token) return token;
          } catch (error) {
            // Template no encontrado, continuar con token por defecto
          }
          
          // Si no hay template, usar el token por defecto
          try {
            const defaultToken = await getToken();
            return defaultToken || undefined;
          } catch (error) {
            // Si falla obtener token, retornar undefined (sin autenticación)
            return undefined;
          }
        },
      });
      
      return client;
    } catch (error) {
      console.error("Error inicializando Convex client:", error);
      // Retornar un cliente con URL por defecto para evitar que la app se rompa
      try {
        return new ConvexReactClient("http://127.0.0.1:3210", {
          fetchAuthToken: async () => {
            if (!isLoaded || !userId) return undefined;
            try {
              const token = await getToken({ template: "convex" });
              if (token) return token;
            } catch {
              // Continuar con token por defecto
            }
            try {
              const defaultToken = await getToken();
              return defaultToken || undefined;
            } catch {
              return undefined;
            }
          },
        });
      } catch {
        return new ConvexReactClient("http://127.0.0.1:3210");
      }
    }
  }, [getToken, userId, isLoaded]);

  // Siempre renderizar la misma estructura para mantener consistencia de hooks
  return (
    <ConvexProvider client={convexClient}>
      {children}
    </ConvexProvider>
  );
}
