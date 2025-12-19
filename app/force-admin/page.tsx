"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";

function ForceAdminContent() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleMakeAdmin = async () => {
    if (!user) {
      setResult({ 
        success: false, 
        message: "Usuario no encontrado. Por favor inicia sesión." 
      });
      return;
    }

    const userEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase() || "";
    const rootAdminEmail = process.env.NEXT_PUBLIC_ROOT_ADMIN_EMAIL?.toLowerCase() || "almontefrederick5@gmail.com";
    
    if (userEmail !== rootAdminEmail) {
      setResult({ 
        success: false, 
        message: `Solo el email ${rootAdminEmail} puede usar esta función.` 
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch("/api/promote-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar el rol");
      }
      
      setResult({ 
        success: true, 
        message: "¡Ahora eres admin! Cerrando sesión para aplicar cambios. Por favor, vuelve a iniciar sesión." 
      });
      
      // IMPORTANTE: Cerrar sesión y volver a iniciar sesión para que Clerk actualice los metadatos
      // Esto es necesario porque Clerk cachea los metadatos en la sesión
      setTimeout(async () => {
        // Cerrar sesión usando Clerk
        await signOut();
        // Redirigir al login
        window.location.href = "/login";
      }, 3000);
    } catch (error: any) {
      setResult({ 
        success: false, 
        message: "Error: " + (error.message || "No se pudo actualizar el rol. Por favor verifica que el servidor esté corriendo.") 
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Si ya es admin, redirigir
    if (isLoaded && user?.publicMetadata?.role === "admin") {
      setTimeout(() => {
        window.location.href = "/admin";
      }, 1000);
    }
  }, [user, isLoaded]);

  if (!isLoaded) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <Navigation />
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Cargando...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const rootAdminEmail = process.env.NEXT_PUBLIC_ROOT_ADMIN_EMAIL || "almontefrederick5@gmail.com";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="text-center mb-6">
              <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
                Hacerse Admin
              </h1>
              <p className="text-gray-600">
                Si tu email es <strong>{rootAdminEmail}</strong>, puedes darte acceso de admin aquí.
              </p>
            </div>

            {result && (
              <div className={`mb-6 p-4 rounded-xl ${
                result.success 
                  ? "bg-green-50 border border-green-200" 
                  : "bg-red-50 border border-red-200"
              }`}>
                <div className="flex items-center gap-3">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <p className={`font-medium ${
                    result.success ? "text-green-800" : "text-red-800"
                  }`}>
                    {result.message}
                  </p>
                </div>
              </div>
            )}

            {userEmail && (
              <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-700">
                  <strong>Email actual:</strong> {userEmail}
                </p>
              </div>
            )}

            <button
              onClick={handleMakeAdmin}
              disabled={isLoading || isAdmin}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : isAdmin ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Ya eres admin</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Hacerme Admin</span>
                </>
              )}
            </button>

            {!isAdmin && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800 text-center mb-2">
                  <strong>⚠️ Importante:</strong> Después de hacerte admin, se cerrará tu sesión automáticamente.
                </p>
                <p className="text-sm text-blue-700 text-center">
                  Deberás volver a iniciar sesión para que los cambios surtan efecto.
                </p>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 text-center">
                Esta función solo funciona si tu email es <strong>{rootAdminEmail}</strong>.
                Si no es tu email, contacta al administrador del sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function ForceAdminPage() {
  return <ForceAdminContent />;
}

