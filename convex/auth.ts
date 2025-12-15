import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Configurar auth con Password provider
// SOLUCIÓN: Usar Password() sin argumentos para evitar leer env vars durante schema load
// Las variables de entorno se leerán en tiempo de ejecución, no durante la evaluación del schema
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password()],
});

// Mutation para asegurar que el perfil de usuario existe (se llama automáticamente cuando se necesita)
// Esta función solo crea un perfil si no existe, pero NO sobrescribe roles existentes
export const ensureUserProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    // Verificar si el perfil ya existe
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (existingProfile) {
      // Si el perfil ya existe, retornarlo sin modificar (respeta el rol asignado)
      return existingProfile._id;
    }
    
    // Si no existe perfil, crear uno con rol por defecto basado en email
    // (solo como fallback, normalmente el perfil se crea desde el admin)
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const userEmail = (user as any)?.email?.toLowerCase() || "";
    const adminEmail = "almontefrederick5@gmail.com";
    const isAdmin = userEmail === adminEmail.toLowerCase();
    
    // Crear perfil con rol apropiado (solo si no existe)
    return await ctx.db.insert("userProfiles", {
      userId,
      role: isAdmin ? "admin" : "visitor",
      createdAt: Date.now(),
    });
  },
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    try {
      const userId = await getAuthUserId(ctx);
      if (!userId) {
        return null;
      }
      const user = await ctx.db.get(userId);
      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },
});

