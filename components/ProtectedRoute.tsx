"use client";

import { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  // Sin autenticación - siempre permitir acceso
  return <>{children}</>;
}

