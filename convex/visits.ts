import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Sin autenticación: obtener todas las visitas
    const visits = await ctx.db
      .query("visits")
      .order("desc")
      .collect();
    
    return await Promise.all(
      visits.map(async (visit) => {
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
      })
    );
  },
});

export const get = query({
  args: { id: v.id("visits") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
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
    // Sin autenticación: obtener el primer usuario disponible o crear uno dummy
    let userId = await getAuthUserId(ctx);
    
    // Si no hay usuario autenticado, obtener el primer usuario de la base de datos
    if (!userId) {
      const firstUser = await ctx.db.query("users").first();
      if (firstUser) {
        userId = firstUser._id;
      } else {
        // Si no hay usuarios, lanzar error (debería haber al menos uno)
        throw new Error("No users available. Please create a user first.");
      }
    }
    
    const doctor = await ctx.db.get(args.doctorId);
    if (!doctor) {
      throw new Error("Doctor not found");
    }
    
    return await ctx.db.insert("visits", {
      doctorId: args.doctorId,
      visitorId: userId,
      date: args.date,
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
    const userId = await getAuthUserId(ctx);
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

