import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getClerkUserId, getUserRole } from "./auth";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      return [];
    }
    
    // Obtener el rol del usuario desde Clerk publicMetadata
    const role = await getUserRole(ctx);
    
    // Si es admin, mostrar todos los doctores
    if (role === "admin") {
      const limit = Math.min(args.limit ?? 1000, 5000);
      return await ctx.db.query("doctors").take(limit);
    }
    
    // Si es visitador, obtener perfil para ver asignaciones
    if (role === "visitor") {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
      
      if (profile?.assignedDoctors && profile.assignedDoctors.length > 0) {
        const assignedDoctors = await Promise.all(
          profile.assignedDoctors.map(async (doctorId) => {
            return await ctx.db.get(doctorId);
          })
        );
        return assignedDoctors.filter((d): d is NonNullable<typeof d> => d !== null);
      }
    }
    
    // Si no hay asignaciones o no es visitador, retornar array vacío
    return [];
  },
});

export const get = query({
  args: { id: v.id("doctors") },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      return null;
    }
    const doctor = await ctx.db.get(args.id);
    if (!doctor || doctor.createdBy !== userId) {
      return null;
    }
    return doctor;
  },
});

export const getWithCenters = query({
  args: { id: v.id("doctors") },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      return null;
    }
    const doctor = await ctx.db.get(args.id);
    if (!doctor || doctor.createdBy !== userId) {
      return null;
    }
    const centers = await Promise.all(
      doctor.medicalCenters.map((centerId) => ctx.db.get(centerId))
    );
    return {
      ...doctor,
      medicalCentersData: centers.filter(Boolean),
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    specialty: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    medicalCenterIds: v.array(v.id("medicalCenters")),
  },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    // Validar que el usuario sea admin
    const role = await getUserRole(ctx);
    if (role !== "admin") {
      throw new Error("Only admins can create doctors");
    }
    
    if (args.medicalCenterIds.length > 2) {
      throw new Error("A doctor can only be associated with up to 2 medical centers");
    }
    return await ctx.db.insert("doctors", {
      name: args.name,
      specialty: args.specialty,
      email: args.email,
      phone: args.phone,
      medicalCenters: args.medicalCenterIds,
      createdBy: userId,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("doctors"),
    name: v.optional(v.string()),
    specialty: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    medicalCenterIds: v.optional(v.array(v.id("medicalCenters"))),
  },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const doctor = await ctx.db.get(args.id);
    if (!doctor || doctor.createdBy !== userId) {
      throw new Error("Doctor not found or unauthorized");
    }
    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.specialty !== undefined) updates.specialty = args.specialty;
    if (args.email !== undefined) updates.email = args.email;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.medicalCenterIds !== undefined) {
      if (args.medicalCenterIds.length > 2) {
        throw new Error("A doctor can only be associated with up to 2 medical centers");
      }
      updates.medicalCenters = args.medicalCenterIds;
    }
    await ctx.db.patch(args.id, updates);
  },
});

export const deleteDoctor = mutation({
  args: {
    id: v.id("doctors"),
  },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    // Verificar si es admin
    const role = await getUserRole(ctx);
    
    const doctor = await ctx.db.get(args.id);
    if (!doctor) {
      throw new Error("Doctor not found");
    }
    
    // Solo el creador o un admin puede eliminar
    if (doctor.createdBy !== userId && role !== "admin") {
      throw new Error("Not authorized to delete this doctor");
    }
    
    await ctx.db.delete(args.id);
  },
});

