"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Stethoscope, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { signIn } = useAuthActions();
  const user = useQuery(api.auth.currentUser);
  const userProfile = useQuery(api.userProfiles.getCurrentProfile);

  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Si el usuario ya está autenticado, redirigir según su rol
  useEffect(() => {
    if (user !== undefined && user !== null && userProfile !== undefined) {
      // Limpiar timeout si existe
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Si es admin, redirigir a /admin, si no, a /
      // Si el perfil es null (no existe), redirigir al dashboard por defecto
      if (userProfile?.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
      
      // Si acabamos de hacer login, resetear el estado de carga
      if (justLoggedIn) {
        setIsLoading(false);
        setJustLoggedIn(false);
      }
    }
  }, [user, userProfile, router, justLoggedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      // Solo permitir inicio de sesión, no registro
      // Usar el username como email para Convex Auth (usa email internamente)
      await signIn("password", {
        email: username, // Convex Auth usa email, pero nosotros lo tratamos como username
        password,
        flow: "signIn", // Solo signIn, no signUp
      });
      
      // Marcar que acabamos de hacer login
      // El useEffect se encargará de la redirección cuando user y userProfile estén disponibles
      setJustLoggedIn(true);
      
      // Timeout de seguridad: si después de 10 segundos no se ha redirigido, redirigir de todas formas
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        setJustLoggedIn(false);
        // Redirigir al dashboard por defecto si no se pudo determinar el rol
        router.push("/");
      }, 10000);
      
    } catch (error: any) {
      console.error("Error en autenticación:", error);
      setError(error.message || "Error al iniciar sesión. Verifica tu usuario y contraseña.");
      setIsLoading(false);
      setJustLoggedIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Stethoscope className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Medical Visitor</h1>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-6 text-center">
          Iniciar Sesión
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingresa tu usuario"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
