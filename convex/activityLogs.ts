import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getClerkUserId } from "./auth";

// Crear log de actividad
export const create = mutation({
  args: {
    action: v.string(),
    entityType: v.string(),
    entityId: v.optional(v.string()),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    return await ctx.db.insert("activityLogs", {
      userId,
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      details: args.details,
      createdAt: Date.now(),
    });
  },
});

// Obtener logs de actividad (sin restricción de admin)
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Sin restricción de admin - permitir acceso a todos
    const logs = await ctx.db
      .query("activityLogs")
      .withIndex("by_createdAt")
      .order("desc")
      .take(args.limit || 100);
    
    // Enriquecer con información del perfil de usuario
    const logsWithUsers = await Promise.all(
      logs.map(async (log) => {
        const userProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", log.userId))
          .first();
        
        return {
          ...log,
          userEmail: null, // Email se obtiene de Clerk, no de Convex
          userName: userProfile?.name || null,
          userId: log.userId, // Clerk user ID
        };
      })
    );
    
    return logsWithUsers;
  },
});

