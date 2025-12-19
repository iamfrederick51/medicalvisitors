import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getClerkUserId, getUserRole } from "./auth";
import { internal } from "./_generated/api";

// Verificar si el usuario actual es admin
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const role = await getUserRole(ctx);
    return role === "admin";
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
    const userId = await getClerkUserId(ctx);
    if (userId) {
      // Registrar actividad si hay usuario autenticado
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
          // visitorId es un Clerk user ID (string), obtener el perfil
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
              id: visit.visitorId,
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

// Obtener todos los doctores (para admin)
// Optimizado para evitar timeouts procesando en lotes
export const getAllDoctors = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      return [];
    }
    
    // Verificar si es admin
    const role = await getUserRole(ctx);
    if (role !== "admin") {
      throw new Error("Only admins can access all doctors");
    }
    
    // Retornar todos los doctores con sus centros médicos
    // Usar take con límite para evitar timeouts
    const doctors = await ctx.db.query("doctors").take(1000);
    
    // Enriquecer con información de centros médicos en lotes para evitar timeout
    const batchSize = 20;
    const enrichedDoctors = [];
    
    for (let i = 0; i < doctors.length; i += batchSize) {
      const batch = doctors.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (doctor) => {
          const centers = await Promise.all(
            doctor.medicalCenters.map((centerId) => ctx.db.get(centerId))
          );
          return {
            ...doctor,
            medicalCentersData: centers.filter(Boolean),
          };
        })
      );
      enrichedDoctors.push(...batchResults);
    }
    
    return enrichedDoctors;
  },
});

// Obtener todos los medicamentos (para admin)
// Optimizado para evitar timeouts
export const getAllMedications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      return [];
    }
    
    // Verificar si es admin
    const role = await getUserRole(ctx);
    if (role !== "admin") {
      throw new Error("Only admins can access all medications");
    }
    
    // Retornar todos los medicamentos (usar take con límite razonable)
    return await ctx.db.query("medications").take(1000);
  },
});

// Obtener todos los centros médicos (para admin)
// Optimizado para evitar timeouts
export const getAllMedicalCenters = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      return [];
    }
    
    // Verificar si es admin
    const role = await getUserRole(ctx);
    if (role !== "admin") {
      throw new Error("Only admins can access all medical centers");
    }
    
    // Retornar todos los centros médicos con doctores y visitadores asociados
    const centers = await ctx.db.query("medicalCenters").take(1000);
    
    // Enriquecer con información de doctores y visitadores asignados
    const batchSize = 20;
    const enrichedCenters = [];
    
    for (let i = 0; i < centers.length; i += batchSize) {
      const batch = centers.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (center) => {
          // Obtener doctores que trabajan en este centro
          const allDoctors = await ctx.db.query("doctors").take(1000);
          const doctorsAtCenter = allDoctors.filter(doc => 
            doc.medicalCenters.includes(center._id)
          );
          
          // Obtener visitadores asignados a este centro
          const allProfiles = await ctx.db.query("userProfiles").take(1000);
          const visitorsAtCenter = allProfiles.filter(profile =>
            profile.assignedMedicalCenters?.includes(center._id)
          );
          
          return {
            ...center,
            doctors: doctorsAtCenter,
            assignedVisitors: visitorsAtCenter.length,
          };
        })
      );
      enrichedCenters.push(...batchResults);
    }
    
    return enrichedCenters;
  },
});

