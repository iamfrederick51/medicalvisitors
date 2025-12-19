import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getClerkUserId } from "./auth";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      return [];
    }
    
    // Obtener el perfil del usuario para verificar si es admin o visitador
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    // Si es admin, mostrar todos los centros médicos
    if (profile?.role === "admin") {
      const limit = Math.min(args.limit ?? 1000, 5000);
      return await ctx.db.query("medicalCenters").take(limit);
    }
    
    // Si es visitador, mostrar solo los centros médicos asignados
    if (profile?.role === "visitor" && profile.assignedMedicalCenters && profile.assignedMedicalCenters.length > 0) {
      const assignedCenters = await Promise.all(
        profile.assignedMedicalCenters.map(async (centerId) => {
          return await ctx.db.get(centerId);
        })
      );
      return assignedCenters.filter((c): c is NonNullable<typeof c> => c !== null);
    }
    
    // Si no hay asignaciones o no es visitador, retornar solo los creados por el usuario
    const limit = Math.min(args.limit ?? 1000, 5000);
    return await ctx.db
      .query("medicalCenters")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", userId))
      .take(limit);
  },
});

export const get = query({
  args: { id: v.id("medicalCenters") },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      return null;
    }
    const center = await ctx.db.get(args.id);
    if (!center || center.createdBy !== userId) {
      return null;
    }
    return center;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    city: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return await ctx.db.insert("medicalCenters", {
      name: args.name,
      address: args.address,
      city: args.city,
      phone: args.phone,
      createdBy: userId,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("medicalCenters"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    // Verificar si es admin
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    const center = await ctx.db.get(args.id);
    if (!center) {
      throw new Error("Medical center not found");
    }
    
    // Solo el creador o un admin puede actualizar
    if (center.createdBy !== userId && profile?.role !== "admin") {
      throw new Error("Medical center not found or unauthorized");
    }
    
    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.address !== undefined) updates.address = args.address;
    if (args.city !== undefined) updates.city = args.city;
    if (args.phone !== undefined) updates.phone = args.phone;
    await ctx.db.patch(args.id, updates);
  },
});

export const deleteMedicalCenter = mutation({
  args: {
    id: v.id("medicalCenters"),
  },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    // Verificar si es admin
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    const center = await ctx.db.get(args.id);
    if (!center) {
      throw new Error("Medical center not found");
    }
    
    // Solo el creador o un admin puede eliminar
    if (center.createdBy !== userId && profile?.role !== "admin") {
      throw new Error("Not authorized to delete this medical center");
    }
    
    await ctx.db.delete(args.id);
  },
});

