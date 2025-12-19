"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

function ForceAdminContent() {
  const router = useRouter();
  const currentUser = useQuery(api.auth.currentUser);
  const userProfile = useQuery(api.userProfiles.getCurrentProfile);
  const forceAdminRole = useMutation(api.userProfiles.forceAdminRole);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleMakeAdmin = useCallback(async () => {
    if (!currentUser || !currentUser._id) {
      setResult({ 
        success: false, 
        message: "Usuario no encontrado. Por favor inicia sesión." 
      });
      return;
    }

    const adminEmail = "almontefrederick5@gmail.com";
    const userEmail = (currentUser as any).email?.toLowerCase() || "";
    
    if (userEmail !== adminEmail.toLowerCase()) {
      setResult({ 
        success: false, 
        message: "Solo el email almontefrederick5@gmail.com puede usar esta función." 
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    
    try {
      // Usar forceAdminRole: solo permite auto-promoción si el email coincide con el allowlist.
      await forceAdminRole({
        userId: currentUser._id,
      });
      
      setResult({ success: true, message: "¡Ahora eres admin! Redirigiendo..." });
      
      setTimeout(() => {
        router.push("/admin");
      }, 2000);
    } catch (error: any) {
      // Si falla updateRole, mostrar error
      setResult({ 
        success: false, 
        message: "Error: " + (error.message || "No se pudo actualizar el rol. Por favor verifica que el servidor de Convex esté corriendo.") 
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, forceAdminRole, router]);

  useEffect(() => {
    // Intentar hacer admin automáticamente cuando se carga la página
    if (currentUser && userProfile?.role !== "admin") {
      const adminEmail = "almontefrederick5@gmail.com";
      const userEmail = (currentUser as any).email?.toLowerCase() || "";
      
      if (userEmail === adminEmail.toLowerCase() && currentUser._id) {
        handleMakeAdmin();
      }
    } else if (currentUser && userProfile?.role === "admin") {
      // Ya es admin, redirigir
      setTimeout(() => {
        router.push("/admin");
      }, 1000);
    }
  }, [currentUser, userProfile, router, handleMakeAdmin]);

  if (currentUser === undefined) {
    return (
      <ProtectedRoute>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="text-center mb-6">
              <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
                Hacerse Admin
              </h1>
              <p className="text-gray-600">
                Si tu email es <strong>almontefrederick5@gmail.com</strong>, puedes darte acceso de admin aquí.
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

            <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Nota importante:</strong> Asegúrate de que <code className="bg-blue-100 px-2 py-1 rounded">npx convex dev</code> esté corriendo en una terminal.
                Si no está corriendo, la función no funcionará.
              </p>
            </div>

            <button
              onClick={handleMakeAdmin}
              disabled={isLoading || userProfile?.role === "admin"}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : userProfile?.role === "admin" ? (
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

            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 text-center">
                Esta función solo funciona si tu email es <strong>almontefrederick5@gmail.com</strong>.
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
