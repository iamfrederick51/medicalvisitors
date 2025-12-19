import { query } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Helper para obtener el Clerk user ID desde el contexto de Convex
 * Usa ctx.auth.getUserIdentity() que funciona cuando Convex está configurado con Clerk
 */
export async function getClerkUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  // El subject del JWT de Clerk es el user ID
  return identity.subject;
}

/**
 * Helper para obtener el rol del usuario desde Clerk publicMetadata
 * Usa ctx.auth.getUserIdentity() para acceder a publicMetadata.role
 */
export async function getUserRole(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  // Acceder a publicMetadata.role desde el JWT de Clerk
  const publicMetadata = identity.publicMetadata as { role?: string } | undefined;
  return publicMetadata?.role || null;
}

/**
 * Query para obtener el usuario actual (compatibilidad con código existente)
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      return null;
    }
    // Retornar un objeto simple con el ID para compatibilidad
    return {
      _id: userId,
    };
  },
});
