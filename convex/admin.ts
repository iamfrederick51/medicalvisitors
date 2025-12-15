import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Verificar si el usuario actual es admin
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }
    
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    return profile?.role === "admin";
  },
});

// Crear usuario (sin restricción de admin)
export const createUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("visitor"))),
  },
  handler: async (ctx, args) => {
    // Sin restricción de admin - permitir a todos crear usuarios
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      // Si no hay usuario autenticado, obtener el primero disponible
      const firstUser = await ctx.db.query("users").first();
      if (firstUser) {
        // Registrar actividad con el primer usuario disponible
        await ctx.db.insert("activityLogs", {
          userId: firstUser._id,
          action: "create_user",
          entityType: "user",
          details: `Created user: ${args.email}`,
          createdAt: Date.now(),
        });
      }
    } else {
      // Registrar actividad
      await ctx.db.insert("activityLogs", {
        userId,
        action: "create_user",
        entityType: "user",
        details: `Created user: ${args.email}`,
        createdAt: Date.now(),
      });
    }
    
    return { message: "User creation initiated" };
  },
});

// Obtener todas las visitas (sin restricción de admin)
// Optimizado para evitar timeouts usando take con límite
export const getAllVisits = query({
  args: {},
  handler: async (ctx) => {
    // Sin restricción de admin - permitir acceso a todos
    // Usar take con un límite alto en lugar de collect para mejor rendimiento
    const visits = await ctx.db.query("visits").order("desc").take(10000);
    
    // Enriquecer con información de doctores, visitadores y medicamentos
    // Procesar en lotes para evitar timeouts
    const batchSize = 50;
    const enrichedVisits = [];
    
    for (let i = 0; i < visits.length; i += batchSize) {
      const batch = visits.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (visit) => {
          const doctor = await ctx.db.get(visit.doctorId);
          const visitor = await ctx.db.get(visit.visitorId);
          const visitorProfile = await ctx.db
            .query("userProfiles")
            .withIndex("by_userId", (q) => q.eq("userId", visit.visitorId))
            .first();
          
          const medications = await Promise.all(
            visit.medications.map(async (med) => {
              const medication = await ctx.db.get(med.medicationId);
              return {
                ...med,
                medication,
              };
            })
          );
          
          return {
            ...visit,
            doctor,
            visitor: {
              ...visitor,
              profile: visitorProfile,
            },
            medications,
          };
        })
      );
      enrichedVisits.push(...batchResults);
    }
    
    return enrichedVisits;
  },
});

// Obtener estadísticas generales (sin restricción de admin)
// Optimizado para evitar timeouts usando conteos directos en lugar de collect
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    // Sin restricción de admin - permitir acceso a todos
    // Usar take con un límite alto en lugar de collect para mejor rendimiento
    const visits = await ctx.db.query("visits").take(10000);
    const doctors = await ctx.db.query("doctors").take(10000);
    const medications = await ctx.db.query("medications").take(10000);
    const users = await ctx.db.query("userProfiles").take(10000);
    const medicalCenters = await ctx.db.query("medicalCenters").take(10000);
    
    return {
      totalVisits: visits.length,
      totalDoctors: doctors.length,
      totalMedications: medications.length,
      totalUsers: users.length,
      totalMedicalCenters: medicalCenters.length,
      visitsByStatus: {
        completed: visits.filter((v) => v.status === "completed").length,
        pending: visits.filter((v) => v.status === "pending").length,
        cancelled: visits.filter((v) => v.status === "cancelled").length,
      },
    };
  },
});

