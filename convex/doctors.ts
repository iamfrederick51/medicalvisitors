import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    return await ctx.db
      .query("doctors")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", userId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("doctors") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
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
    const userId = await getAuthUserId(ctx);
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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
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
    const userId = await getAuthUserId(ctx);
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

