import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Función de utilidad para hacerte admin a ti mismo
// Esta función puede ser llamada desde el cliente para darte acceso de admin
export const makeMeAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    // Obtener el usuario para verificar el email
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Verificar si es el email del admin
    const adminEmail = "almontefrederick5@gmail.com";
    const userEmail = user.email?.toLowerCase() || "";
    const isAdminEmail = userEmail === adminEmail.toLowerCase();
    
    if (!isAdminEmail) {
      throw new Error("Only the admin email can use this function");
    }
    
    // Buscar o crear perfil
    let profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!profile) {
      // Crear perfil como admin
      await ctx.db.insert("userProfiles", {
        userId,
        role: "admin",
        createdAt: Date.now(),
      });
    } else {
      // Actualizar a admin
      await ctx.db.patch(profile._id, {
        role: "admin",
      });
    }
    
    return { success: true, message: "You are now an admin!" };
  },
});

