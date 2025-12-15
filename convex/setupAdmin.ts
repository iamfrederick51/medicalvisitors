import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Función de utilidad para hacer admin a un usuario por email
// Esta función puede ser llamada manualmente si es necesario
export const makeAdminByEmail = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Buscar todos los usuarios y encontrar el que tenga ese email
    // Nota: Esto requiere acceso a authTables, que no tenemos directamente
    // Por ahora, esta función es una utilidad que puede ser llamada desde el dashboard de Convex
    
    // Buscar en userProfiles y actualizar el rol
    const profiles = await ctx.db.query("userProfiles").collect();
    
    // Necesitamos encontrar el userId que corresponde al email
    // Esto es complicado porque no tenemos acceso directo a authTables desde aquí
    // Pero podemos intentar actualizar todos los perfiles y verificar después
    
    return { message: "Use Convex Dashboard to manually update user role" };
  },
});

// Función más simple: hacer admin a un usuario por userId
export const makeAdminByUserId = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!profile) {
      // Crear perfil como admin
      await ctx.db.insert("userProfiles", {
        userId: args.userId,
        role: "admin",
        createdAt: Date.now(),
      });
    } else {
      // Actualizar a admin
      await ctx.db.patch(profile._id, {
        role: "admin",
      });
    }
    
    return { success: true };
  },
});

