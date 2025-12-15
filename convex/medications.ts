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
      .query("medications")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", userId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("medications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const medication = await ctx.db.get(args.id);
    if (!medication || medication.createdBy !== userId) {
      return null;
    }
    return medication;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    unit: v.union(v.literal("units"), v.literal("boxes"), v.literal("samples")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return await ctx.db.insert("medications", {
      name: args.name,
      description: args.description,
      unit: args.unit,
      createdBy: userId,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("medications"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    unit: v.optional(
      v.union(v.literal("units"), v.literal("boxes"), v.literal("samples"))
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const medication = await ctx.db.get(args.id);
    if (!medication || medication.createdBy !== userId) {
      throw new Error("Medication not found or unauthorized");
    }
    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.unit !== undefined) updates.unit = args.unit;
    await ctx.db.patch(args.id, updates);
  },
});

