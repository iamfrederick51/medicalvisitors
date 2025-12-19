"use client";

import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/lib/convex-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ConvexSetupMessage } from "@/components/ConvexSetupMessage";
import { RoleRedirect } from "@/app/components/RoleRedirect";

/**
 * ClientProviders - Envuelve la aplicación con todos los providers necesarios
 * 
 * IMPORTANTE: Este componente debe siempre renderizar la misma estructura
 * para evitar problemas con el orden de los hooks de React.
 * 
 * NOTA: ConvexErrorBoundary removido temporalmente para diagnosticar el problema de hooks.
 */
export function ClientProviders({ children }: { children: ReactNode }) {
  // Renderizar siempre la misma estructura sin condiciones
  // El orden de los providers es importante y no debe cambiar
  // Todos los hooks deben llamarse siempre en el mismo orden
  return (
    <ClerkProvider
      signInUrl="/login"
      signUpUrl="/sign-up"
      afterSignInUrl="/post-login"
      afterSignUpUrl="/post-login"
    >
      <ConvexSetupMessage />
      <ConvexClientProvider>
        <LanguageProvider>
          <RoleRedirect />
          {children}
        </LanguageProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}

