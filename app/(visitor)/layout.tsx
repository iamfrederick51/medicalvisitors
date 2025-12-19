import { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";
import { EnsureUserProfile } from "@/components/EnsureUserProfile";

export default function VisitorLayout({ children }: { children: ReactNode }) {
  return (
    <EnsureUserProfile>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Navigation />
        {children}
      </div>
    </EnsureUserProfile>
  );
}
