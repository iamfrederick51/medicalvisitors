import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getClerkUserId } from "./auth";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // IMPORTANTE: Evitar .collect() y N+1 queries grandes para no exceder el timeout (1s).
    const limit = Math.min(args.limit ?? 100, 500);

    const visits = await ctx.db.query("visits").order("desc").take(limit);

    const doctorIds = Array.from(new Set(visits.map((v) => v.doctorId)));
    const medicationIds = Array.from(
      new Set(visits.flatMap((v) => v.medications.map((m) => m.medicationId)))
    );

    const doctorsMap = new Map();
    const medicationsMap = new Map();

    await Promise.all(
      doctorIds.map(async (id) => {
        const doctor = await ctx.db.get(id);
        if (doctor) doctorsMap.set(id, doctor);
      })
    );

    await Promise.all(
      medicationIds.map(async (id) => {
        const medication = await ctx.db.get(id);
        if (medication) medicationsMap.set(id, medication);
      })
    );

    return visits.map((visit) => ({
      ...visit,
      doctor: doctorsMap.get(visit.doctorId) ?? null,
      medications: visit.medications.map((med) => ({
        ...med,
        medication: medicationsMap.get(med.medicationId) ?? null,
      })),
    }));
  },
});

export const get = query({
  args: { id: v.id("visits") },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      return null;
    }
    const visit = await ctx.db.get(args.id);
    if (!visit || visit.visitorId !== userId) {
      return null;
    }
    const doctor = await ctx.db.get(visit.doctorId);
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
      medications,
    };
  },
});

export const create = mutation({
  args: {
    doctorId: v.id("doctors"),
    date: v.number(),
    medicalCenterId: v.optional(v.id("medicalCenters")),
    medications: v.array(
      v.object({
        medicationId: v.id("medications"),
        quantity: v.number(),
        notes: v.optional(v.string()),
      })
    ),
    notes: v.optional(v.string()),
    status: v.union(v.literal("completed"), v.literal("pending"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    const doctor = await ctx.db.get(args.doctorId);
    if (!doctor) {
      throw new Error("Doctor not found");
    }
    
    return await ctx.db.insert("visits", {
      doctorId: args.doctorId,
      visitorId: userId,
      date: args.date,
      medicalCenterId: args.medicalCenterId,
      medications: args.medications,
      notes: args.notes,
      status: args.status,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("visits"),
    doctorId: v.optional(v.id("doctors")),
    date: v.optional(v.number()),
    medications: v.optional(
      v.array(
        v.object({
          medicationId: v.id("medications"),
          quantity: v.number(),
          notes: v.optional(v.string()),
        })
      )
    ),
    notes: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("completed"), v.literal("pending"), v.literal("cancelled"))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const visit = await ctx.db.get(args.id);
    if (!visit || visit.visitorId !== userId) {
      throw new Error("Visit not found or unauthorized");
    }
    const updates: any = {};
    if (args.doctorId !== undefined) {
      const doctor = await ctx.db.get(args.doctorId);
      if (!doctor || doctor.createdBy !== userId) {
        throw new Error("Doctor not found or unauthorized");
      }
      updates.doctorId = args.doctorId;
    }
    if (args.date !== undefined) updates.date = args.date;
    if (args.medications !== undefined) updates.medications = args.medications;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.status !== undefined) updates.status = args.status;
    await ctx.db.patch(args.id, updates);
  },
});

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // Sin autenticación: obtener todas las visitas recientes
    const limit = args.limit || 5;
    const visits = await ctx.db
      .query("visits")
      .order("desc")
      .take(limit);
    
    return await Promise.all(
      visits.map(async (visit) => {
        const doctor = await ctx.db.get(visit.doctorId);
        return {
          ...visit,
          doctor,
        };
      })
    );
  },
});

// Obtener visitas recientes del visitador actual
export const getRecentByVisitor = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // Obtener el usuario autenticado actual
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      return [];
    }
    
    const limit = args.limit || 10;
    
    // Obtener visitas del visitador actual usando el índice
    const visits = await ctx.db
      .query("visits")
      .withIndex("by_visitorId", (q) => q.eq("visitorId", userId))
      .order("desc")
      .take(limit);
    
    // Enriquecer con información completa, evitando N+1 repetido.
    const doctorIds = Array.from(new Set(visits.map((v) => v.doctorId)));
    const medicationIds = Array.from(
      new Set(visits.flatMap((v) => v.medications.map((m) => m.medicationId)))
    );
    const medicalCenterIds = Array.from(
      new Set(
        visits
          .map((v) => v.medicalCenterId)
          .filter((id): id is NonNullable<typeof id> => id !== undefined)
      )
    );

    const doctorsMap = new Map();
    const medicationsMap = new Map();
    const centersMap = new Map();

    await Promise.all(
      doctorIds.map(async (id) => {
        const doctor = await ctx.db.get(id);
        if (doctor) doctorsMap.set(id, doctor);
      })
    );
    await Promise.all(
      medicationIds.map(async (id) => {
        const medication = await ctx.db.get(id);
        if (medication) medicationsMap.set(id, medication);
      })
    );
    await Promise.all(
      medicalCenterIds.map(async (id) => {
        const center = await ctx.db.get(id);
        if (center) centersMap.set(id, center);
      })
    );

    const visitorProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return visits.map((visit) => ({
      ...visit,
      doctor: doctorsMap.get(visit.doctorId) ?? null,
      visitor: {
        name: visitorProfile?.name || null,
        profile: visitorProfile ?? null,
      },
      medicalCenter: visit.medicalCenterId
        ? centersMap.get(visit.medicalCenterId) ?? null
        : null,
      medications: visit.medications.map((med) => ({
        ...med,
        medication: medicationsMap.get(med.medicationId) ?? null,
      })),
    }));
  },
});

