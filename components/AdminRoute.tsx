"use client";

import { ReactNode, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Loader2, AlertCircle } from "lucide-react";

/**
 * AdminRoute - Verifica rol de admin
 * El middleware se encarga de los redirects
 * Este componente solo verifica y muestra UI apropiada
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { isSignedIn, user, isLoaded } = useUser();
  const [hasTriedRefresh, setHasTriedRefresh] = useState(false);

  // Debug: Log del rol para diagnosticar
  useEffect(() => {
    if (isLoaded && user) {
      const publicMetadataRole = user?.publicMetadata?.role as string | undefined;
      const metadataRole = (user as any)?.metadata?.role as string | undefined;
      const role = publicMetadataRole || metadataRole;
      
      console.log("[AdminRoute] User role check:", {
        isSignedIn,
        publicMetadataRole,
        metadataRole,
        finalRole: role,
        publicMetadata: user.publicMetadata,
        metadata: (user as any)?.metadata,
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
      });
    }
  }, [isLoaded, user, isSignedIn]);

  // Intentar refrescar la sesión si el rol no se detecta pero el usuario debería ser admin
  useEffect(() => {
    if (isLoaded && user && !hasTriedRefresh) {
      const publicMetadataRole = user?.publicMetadata?.role as string | undefined;
      const metadataRole = (user as any)?.metadata?.role as string | undefined;
      const role = publicMetadataRole || metadataRole;
      
      // Si no hay rol pero el email es el admin, intentar refrescar
      const adminEmail = "almontefrederick5@gmail.com";
      const userEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase() || "";
      
      if (userEmail === adminEmail && role !== "admin") {
        console.log("[AdminRoute] Admin email detected but role not found, attempting to refresh session...");
        setHasTriedRefresh(true);
        // Forzar recarga de la página para refrescar la sesión de Clerk
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    }
  }, [isLoaded, user, hasTriedRefresh]);

  // Mostrar loading mientras Clerk carga
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <div className="text-gray-600">Cargando...</div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, el middleware ya redirigió
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <div className="text-gray-600">No autenticado</div>
        </div>
      </div>
    );
  }

  // Intentar obtener el rol desde diferentes lugares
  const publicMetadataRole = user?.publicMetadata?.role as string | undefined;
  const metadataRole = (user as any)?.metadata?.role as string | undefined;
  const role = publicMetadataRole || metadataRole;
  
  // Debug: Log detallado
  console.log("[AdminRoute] Role check:", {
    publicMetadataRole,
    metadataRole,
    finalRole: role,
    publicMetadata: user?.publicMetadata,
    metadata: (user as any)?.metadata,
  });
  
  // Si no es admin, mostrar mensaje en lugar de null
  if (role !== "admin") {
    const adminEmail = "almontefrederick5@gmail.com";
    const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || "";
    const isAdminEmail = userEmail === adminEmail;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-lg">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 mb-4">
            No tienes permisos de administrador.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Rol actual: <strong>{role || "sin rol"}</strong>
          </p>
          
          {isAdminEmail && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 mb-3">
                <strong>Tu email es el admin:</strong> {userEmail}
              </p>
              <p className="text-xs text-blue-700 mb-3">
                El rol no se está detectando. Necesitas actualizar tu rol en Clerk.
              </p>
              <a
                href="/force-admin"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Actualizar Rol a Admin
              </a>
            </div>
          )}
          
          {!isAdminEmail && (
            <p className="text-xs text-gray-400 mt-4">
              Si crees que esto es un error, contacta al administrador del sistema.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Si es admin y está autenticado, renderizar el contenido
  return <>{children}</>;
}
