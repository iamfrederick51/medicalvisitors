import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DebugClerkRolePage() {
  const user = await currentUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No autenticado</h1>
          <a href="/login" className="text-blue-600 underline">Ir a login</a>
        </div>
      </div>
    );
  }

  const publicMetadata = user.publicMetadata as { role?: string } | undefined;
  const role = publicMetadata?.role;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Debug: Clerk Role</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-4">
          <h2 className="text-xl font-semibold mb-4">Información del Usuario</h2>
          <div className="space-y-2">
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
            <p><strong>Nombre:</strong> {user.firstName} {user.lastName}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-4">
          <h2 className="text-xl font-semibold mb-4">PublicMetadata (Raw)</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(user.publicMetadata, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-4">
          <h2 className="text-xl font-semibold mb-4">Rol Extraído</h2>
          <div className="space-y-2">
            <p><strong>Role:</strong> {role || "undefined"}</p>
            <p><strong>Type:</strong> {typeof role}</p>
            <p><strong>Is Admin:</strong> {role === "admin" ? "✅ SÍ" : "❌ NO"}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-4">
          <h2 className="text-xl font-semibold mb-4">Acciones</h2>
          <div className="space-y-2">
            <a 
              href="/api/setup-admin" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              target="_blank"
            >
              Hacer Admin (API)
            </a>
            <br />
            <a 
              href="/force-admin" 
              className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Force Admin (Convex)
            </a>
            <br />
            <a 
              href="/post-login" 
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Probar Post-Login
            </a>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <p className="font-semibold mb-2">⚠️ Importante:</p>
          <p>Si el rol no aparece aquí, necesitas:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Ir a <code className="bg-yellow-100 px-2 py-1 rounded">/api/setup-admin</code> para actualizar el rol en Clerk</li>
            <li>Cerrar sesión completamente</li>
            <li>Volver a iniciar sesión</li>
            <li>El JWT de Clerk debe incluir publicMetadata en el token</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

