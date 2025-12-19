"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";

export default function DebugRolePage() {
  const currentUser = useQuery(api.auth.currentUser);
  const userProfile = useQuery(api.userProfiles.getCurrentProfile);
  const isAdmin = useQuery(api.admin.isAdmin);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Debug: Información de Rol</h1>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="font-semibold text-gray-900 mb-2">Usuario Autenticado</h2>
                <pre className="text-sm text-gray-700 overflow-auto">
                  {JSON.stringify(currentUser, null, 2)}
                </pre>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="font-semibold text-gray-900 mb-2">Perfil de Usuario</h2>
                <pre className="text-sm text-gray-700 overflow-auto">
                  {JSON.stringify(userProfile, null, 2)}
                </pre>
                {userProfile && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm">
                      <strong>Rol actual:</strong> <span className="font-mono">{userProfile.role || "No definido"}</span>
                    </p>
                    <p className="text-sm mt-2">
                      <strong>Es admin:</strong> {userProfile.role === "admin" ? "✅ Sí" : "❌ No"}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="font-semibold text-gray-900 mb-2">Query isAdmin</h2>
                <pre className="text-sm text-gray-700 overflow-auto">
                  {JSON.stringify(isAdmin, null, 2)}
                </pre>
                {isAdmin !== undefined && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm">
                      <strong>Resultado:</strong> {isAdmin ? "✅ Es admin" : "❌ No es admin"}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h2 className="font-semibold text-yellow-900 mb-2">Estado de Carga</h2>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>Usuario: {currentUser === undefined ? "⏳ Cargando..." : currentUser === null ? "❌ No autenticado" : "✅ Autenticado"}</li>
                  <li>Perfil: {userProfile === undefined ? "⏳ Cargando..." : userProfile === null ? "❌ No encontrado" : "✅ Encontrado"}</li>
                  <li>isAdmin: {isAdmin === undefined ? "⏳ Cargando..." : isAdmin ? "✅ Sí" : "❌ No"}</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h2 className="font-semibold text-green-900 mb-2">Acciones</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Recargar página
                  </button>
                  <button
                    onClick={() => {
                      console.log("=== DEBUG INFO ===");
                      console.log("Current User:", currentUser);
                      console.log("User Profile:", userProfile);
                      console.log("Is Admin:", isAdmin);
                      alert("Información enviada a la consola. Abre las herramientas de desarrollador (F12) para verla.");
                    }}
                    className="ml-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Ver en consola
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

