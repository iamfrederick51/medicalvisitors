/**
 * Configuración de autenticación para Convex con Clerk
 * 
 * IMPORTANTE: Para que la autenticación funcione correctamente, necesitas configurar CLERK_ISSUER_URL
 * 
 * Para desarrollo local:
 * 1. Obtén tu Clerk Issuer URL del Dashboard de Clerk:
 *    - Ve a https://dashboard.clerk.com
 *    - Selecciona tu aplicación
 *    - Ve a Settings → API Keys
 *    - Copia el "Issuer URL" (formato: https://your-domain.clerk.accounts.dev)
 * 2. Configúralo en Convex usando:
 *    npx convex env set CLERK_ISSUER_URL "https://your-domain.clerk.accounts.dev"
 *    O ejecuta: node scripts/get-clerk-issuer.js
 * 3. Reinicia Convex: npx convex dev
 * 
 * Para producción:
 * - Configura CLERK_ISSUER_URL en Convex Dashboard → Settings → Environment Variables
 * 
 * NOTA: En desarrollo local, Convex lee las variables de entorno desde:
 * - Variables configuradas con `npx convex env set` (RECOMENDADO)
 * - Variables en el archivo .env.local (si están disponibles)
 */

// Intentar obtener CLERK_ISSUER_URL desde múltiples fuentes
const clerkIssuerUrl = 
  process.env.CLERK_ISSUER_URL || 
  process.env.CONVEX_CLERK_ISSUER_URL;

if (!clerkIssuerUrl) {
  console.warn(
    "⚠️  [Convex Auth] CLERK_ISSUER_URL no está configurado.\n" +
    "   La autenticación NO funcionará sin esta configuración.\n" +
    "\n" +
    "   Para configurarlo:\n" +
    "   1. Obtén tu Issuer URL del Dashboard de Clerk (Settings → API Keys → Issuer URL)\n" +
    "   2. Ejecuta: npx convex env set CLERK_ISSUER_URL \"https://your-domain.clerk.accounts.dev\"\n" +
    "      O usa el script: node scripts/get-clerk-issuer.js\n" +
    "   3. Reinicia Convex: npx convex dev\n" +
    "\n" +
    "   Sin esta configuración, recibirás errores 'Not authenticated' en todas las funciones de Convex."
  );
}

// Exportar configuración
// Si no hay issuer URL, el provider será un array vacío, lo que causará errores de autenticación
// pero permitirá que el código se ejecute (útil para desarrollo/debugging)
export default {
  providers: clerkIssuerUrl
    ? [
        {
          domain: clerkIssuerUrl,
          applicationID: "convex",
        },
      ]
    : [],
};

