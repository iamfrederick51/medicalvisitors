"use client";

import { ReactNode } from "react";
import { EnsureUserProfile } from "@/components/EnsureUserProfile";

export function AdminLayoutClient({ children }: { children: ReactNode }) {
  return (
    <EnsureUserProfile>
      {children}
    </EnsureUserProfile>
  );
}

