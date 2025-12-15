"use client";

import { ReactNode } from "react";
import { ConvexClientProvider } from "@/lib/convex-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ConvexSetupMessage } from "@/components/ConvexSetupMessage";
import { ConvexErrorBoundary } from "@/components/ConvexErrorBoundary";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ConvexErrorBoundary>
      <ConvexSetupMessage />
      <ConvexClientProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </ConvexClientProvider>
    </ConvexErrorBoundary>
  );
}

