import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Obtener perfil del usuario actual
export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    return profile;
  },
});

// Obtener perfil por userId
export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    return profile;
  },
});

// Crear perfil de usuario (por defecto visitor)
export const create = mutation({
  args: {
    userId: v.id("users"),
    role: v.optional(v.union(v.literal("admin"), v.literal("visitor"))),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    if (existing) {
      return existing._id;
    }
    
    return await ctx.db.insert("userProfiles", {
      userId: args.userId,
      role: args.role || "visitor",
      name: args.name,
      createdAt: Date.now(),
    });
  },
});

// Función simple para hacerte admin (verifica email)
// Esta función permite que el email específico se haga admin a sí mismo
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
    const userEmail = (user as any).email?.toLowerCase() || "";
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

// Función para asegurar que el perfil de admin existe (cambiada a mutation normal)
export const ensureAdminProfile = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Obtener el usuario para verificar el email
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return;
    }
    
    // Verificar si es el email del admin
    const adminEmail = "almontefrederick5@gmail.com";
    const userEmail = (user as any).email?.toLowerCase() || "";
    const isAdminEmail = userEmail === adminEmail.toLowerCase();
    
    if (!isAdminEmail) {
      return;
    }
    
    // Buscar o crear perfil
    let profile = await ctx.db
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
    } else if (profile.role !== "admin") {
      // Actualizar a admin
      await ctx.db.patch(profile._id, {
        role: "admin",
      });
    }
  },
});

// Función alternativa: actualizar rol sin verificar admin (solo para el email específico)
export const forceAdminRole = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verificar que el usuario que llama es el mismo que se está actualizando
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId || currentUserId !== args.userId) {
      throw new Error("You can only update your own role");
    }
    
    // Obtener el usuario para verificar el email
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Verificar si es el email del admin
    const adminEmail = "almontefrederick5@gmail.com";
    const userEmail = (user as any).email?.toLowerCase() || "";
    const isAdminEmail = userEmail === adminEmail.toLowerCase();
    
    if (!isAdminEmail) {
      throw new Error("Only the admin email can use this function");
    }
    
    // Buscar o crear perfil
    let profile = await ctx.db
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
    
    return { success: true, message: "You are now an admin!" };
  },
});

// Actualizar rol de usuario (solo admin)
export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("visitor")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    
    // Verificar que el usuario actual es admin
    const currentProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", currentUserId))
      .first();
    
    if (!currentProfile || currentProfile.role !== "admin") {
      throw new Error("Only admins can update roles");
    }
    
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!profile) {
      throw new Error("Profile not found");
    }
    
    await ctx.db.patch(profile._id, {
      role: args.role,
    });
    
    return profile._id;
  },
});

// Listar todos los usuarios (solo admin)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    
    // Verificar que el usuario actual es admin
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!profile || profile.role !== "admin") {
      return [];
    }
    
    const profiles = await ctx.db.query("userProfiles").collect();
    
    // Obtener información de usuarios de authTables
    const profilesWithUsers = await Promise.all(
      profiles.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        return {
          ...profile,
          email: user?.email || null,
        };
      })
    );
    
    return profilesWithUsers;
  },
});

