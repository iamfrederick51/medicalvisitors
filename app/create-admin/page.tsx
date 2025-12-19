"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { AdminRoute } from "@/components/AdminRoute";
import { Navigation } from "@/components/Navigation";
import { Shield, CheckCircle, XCircle, Loader2, UserPlus } from "lucide-react";

export default function CreateAdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const { signIn, signOut } = useAuthActions();
  const createUser = useMutation(api.users.create);
  const currentUser = useQuery(api.auth.currentUser);
  const userProfile = useQuery(api.userProfiles.getCurrentProfile);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setResult({ success: false, message: "Por favor completa todos los campos requeridos" });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Paso 1: Crear el usuario usando signIn con flow: "signUp"
      let userCreated = false;
      try {
        await signIn("password", {
          email: username,
          password: password,
          flow: "signUp",
        });
        userCreated = true;
        console.log("Usuario creado exitosamente");
      } catch (signUpError: any) {
        const errorMsg = signUpError.message?.toLowerCase() || "";
        if (errorMsg.includes("already exists") || 
            errorMsg.includes("already registered") ||
            errorMsg.includes("user already exists")) {
          userCreated = true; // El usuario ya existe
          console.log("Usuario ya existe, continuando...");
        } else {
          throw signUpError;
        }
      }

      // Paso 2: Crear/actualizar el perfil con rol admin
      const result = await createUser({
        username: username,
        password: password,
        name: name || undefined,
        role: "admin", // FORZAR rol admin
        assignedDoctors: [],
        assignedMedications: [],
        assignedMedicalCenters: [],
      });

      if (result.success) {
        setResult({ 
          success: true, 
          message: `Usuario admin creado exitosamente! Usuario: ${username}, Contraseña: ${password}. Serás redirigido al login para iniciar sesión.` 
        });

        // Cerrar sesión del usuario recién creado
        try {
          await signOut();
        } catch (error) {
          console.error("Error signing out:", error);
        }

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      } else {
        setResult({ success: false, message: result.message || "Error al crear el usuario" });
      }
    } catch (error: any) {
      console.error("Error creating admin user:", error);
      setResult({ 
        success: false, 
        message: `Error: ${error.message || "Error desconocido al crear el usuario admin"}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-semibold text-gray-900">Crear Usuario Administrador</h1>
            </div>

            <p className="text-gray-600 mb-6">
              Esta página te permite crear un nuevo usuario con permisos de administrador.
              Después de crearlo, podrás iniciar sesión y acceder al panel de administración.
            </p>

            {/* Información del usuario actual */}
            {currentUser && userProfile && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Usuario actual:</strong> {(currentUser as any)?.email || "N/A"}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Rol actual:</strong> {userProfile.role || "No definido"}
                </p>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario (Email) *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  placeholder="usuario@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre (Opcional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  placeholder="Nombre completo"
                />
              </div>

              {result && (
                <div className={`p-4 rounded-lg ${
                  result.success 
                    ? "bg-green-50 border border-green-200" 
                    : "bg-red-50 border border-red-200"
                }`}>
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        result.success ? "text-green-800" : "text-red-800"
                      }`}>
                        {result.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creando usuario admin...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Crear Usuario Administrador
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Después de crear el usuario, serás redirigido al login. 
                Usa las credenciales que acabas de crear para iniciar sesión y acceder al panel de administración.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}

