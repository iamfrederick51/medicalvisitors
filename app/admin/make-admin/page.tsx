"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

function MakeAdminContent() {
  const currentUser = useQuery(api.auth.currentUser);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const router = useRouter();

  // Intentar usar makeMeAdmin, pero si no funciona, usar forceAdminRole
  const makeMeAdmin = useMutation(api.userProfiles.makeMeAdmin);
  const forceAdminRole = useMutation(api.userProfiles.forceAdminRole);

  // Verificar automáticamente si ya es admin
  useEffect(() => {
    if (currentUser?.profile?.role === "admin") {
      setResult({ success: true, message: "Ya eres admin! Redirigiendo..." });
      setTimeout(() => {
        router.push("/admin");
      }, 1500);
    }
  }, [currentUser, router]);

  const handleMakeAdmin = async () => {
    if (!currentUser || !currentUser._id) {
      setResult({ 
        success: false, 
        message: "Usuario no encontrado. Por favor recarga la página." 
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    
    try {
      // Intentar primero con makeMeAdmin
      try {
        const response = await makeMeAdmin({});
        setResult({ success: true, message: response.message || "¡Ahora eres admin!" });
        
        // Redirigir al admin después de 2 segundos
        setTimeout(() => {
          router.push("/admin");
        }, 2000);
      } catch (err: any) {
        // Si makeMeAdmin falla, intentar con forceAdminRole
        const errorMsg = err.message || err.toString() || "";
        if (errorMsg.includes("Could not find public function") || errorMsg.includes("makeMeAdmin")) {
          try {
            const response = await forceAdminRole({ userId: currentUser._id });
            setResult({ success: true, message: response.message || "¡Ahora eres admin!" });
            
            setTimeout(() => {
              router.push("/admin");
            }, 2000);
          } catch (err2: any) {
            throw new Error("Error: Las funciones no están disponibles. Por favor asegúrate de que 'npx convex dev' esté corriendo y espera unos segundos para que detecte los cambios.");
          }
        } else {
          throw err;
        }
      }
    } catch (error: any) {
      setResult({ 
        success: false, 
        message: error.message || "Error al hacerte admin. Asegúrate de que 'npx convex dev' esté corriendo." 
      });
    } finally {
      setIsLoading(false);
    }
  };

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

            {currentUser === undefined ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Cargando información del usuario...</p>
              </div>
            ) : currentUser?.profile?.role === "admin" ? (
              <div className="w-full bg-green-50 border border-green-200 text-green-800 py-3 px-6 rounded-xl font-semibold text-center">
                <CheckCircle className="w-5 h-5 inline mr-2" />
                Ya eres admin
              </div>
            ) : (
              <button
                onClick={handleMakeAdmin}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Hacerme Admin</span>
                  </>
                )}
              </button>
            )}

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

export default function MakeAdminPage() {
  return <MakeAdminContent />;
}

