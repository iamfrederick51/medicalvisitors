import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getClerkUserId } from "./auth";

// Obtener perfil del usuario actual
export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    try {
      const userId = await getClerkUserId(ctx);
      
      if (!userId) {
        return null;
      }
      
      // Buscar perfil usando el índice
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
      
      return profile;
    } catch (error) {
      console.error("[getCurrentProfile] Error getting profile:", error);
      return null;
    }
  },
});

// Mutation para asegurar que el perfil existe
export const ensureForCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    // Verificar si el perfil ya existe
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (existingProfile) {
      return existingProfile._id;
    }
    
    // Obtener el rol desde Clerk publicMetadata si está disponible
    const identity = await ctx.auth.getUserIdentity();
    const clerkRole = identity?.publicMetadata 
      ? (identity.publicMetadata as { role?: string })?.role 
      : undefined;
    
    // Usar el rol de Clerk si existe y es válido, sino usar "visitor" por defecto
    const defaultRole: "admin" | "visitor" = "visitor";
    const finalRole = (clerkRole === "admin" || clerkRole === "visitor") 
      ? clerkRole 
      : defaultRole;
    
    // Crear perfil con rol por defecto "visitor" (o el rol de Clerk si existe)
    const profileId = await ctx.db.insert("userProfiles", {
      userId,
      role: finalRole,
      createdAt: Date.now(),
    });
    
    return profileId;
  },
});

// Obtener asignaciones completas del usuario actual
export const getCurrentAssignments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      return null;
    }
    
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (!profile) {
      return null;
    }
    
    // Obtener datos completos de doctores asignados
    const assignedDoctors = profile.assignedDoctors && profile.assignedDoctors.length > 0
      ? await Promise.all(
          profile.assignedDoctors.map(async (id) => {
            return await ctx.db.get(id);
          })
        ).then(doctors => doctors.filter(d => d !== null))
      : [];
    
    // Obtener datos completos de medicamentos asignados
    const assignedMedications = profile.assignedMedications && profile.assignedMedications.length > 0
      ? await Promise.all(
          profile.assignedMedications.map(async (id) => {
            return await ctx.db.get(id);
          })
        ).then(medications => medications.filter(m => m !== null))
      : [];
    
    // Obtener datos completos de centros médicos asignados
    const assignedMedicalCenters = profile.assignedMedicalCenters && profile.assignedMedicalCenters.length > 0
      ? await Promise.all(
          profile.assignedMedicalCenters.map(async (id) => {
            return await ctx.db.get(id);
          })
        ).then(centers => centers.filter(c => c !== null))
      : [];
    
    return {
      ...profile,
      assignedDoctors,
      assignedMedications,
      assignedMedicalCenters,
    };
  },
});

// Obtener perfil por userId (Clerk user ID)
export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    try {
      console.log("[getByUserId] Query started for userId:", args.userId);
      
      // Validar argumentos
      if (!args.userId || typeof args.userId !== 'string') {
        console.error("[getByUserId] Invalid userId:", args.userId);
        return null;
      }

      // Usar índice para búsqueda rápida
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .first();
      
      console.log("[getByUserId] Query completed. Profile found:", !!profile);
      if (profile) {
        console.log("[getByUserId] Profile role:", profile.role);
      }
      
      return profile;
    } catch (error) {
      console.error("[getByUserId] Error:", error);
      return null;
    }
  },
});

// Crear perfil de usuario
export const create = mutation({
  args: {
    userId: v.string(),
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

// Actualizar rol de usuario (solo admin)
export const updateRole = mutation({
  args: {
    userId: v.string(),
    role: v.union(v.literal("admin"), v.literal("visitor")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getClerkUserId(ctx);
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
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
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
    
    const limit = Math.min(args.limit ?? 1000, 5000);
    const profiles = await ctx.db.query("userProfiles").take(limit);
    
    return profiles;
  },
});

// Sincronizar usuario desde Clerk (usado por webhook)
// IMPORTANTE: El rol por defecto es "visitor" para todos los usuarios nuevos
export const syncFromClerk = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("visitor"))),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    // Rol por defecto: "visitor" para usuarios nuevos
    // Si se proporciona un rol, usarlo; si no, usar "visitor"
    const defaultRole: "admin" | "visitor" = "visitor";
    const finalRole = args.role || defaultRole;
    
    if (existing) {
      // Actualizar perfil existente
      // Si el rol viene de Clerk (args.role), actualizarlo
      // Si no viene, mantener el rol existente
      await ctx.db.patch(existing._id, {
        name: args.name || existing.name,
        role: args.role !== undefined ? args.role : existing.role,
      });
      return existing._id;
    }
    
    // Crear nuevo perfil con rol por defecto "visitor"
    return await ctx.db.insert("userProfiles", {
      userId: args.userId,
      role: finalRole,
      name: args.name,
      createdAt: Date.now(),
    });
  },
});
