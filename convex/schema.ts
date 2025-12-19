import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  doctors: defineTable({
    name: v.string(),
    specialty: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    medicalCenters: v.array(v.id("medicalCenters")),
    createdBy: v.string(), // Clerk user ID
    createdAt: v.number(),
  })
    .index("by_createdBy", ["createdBy"])
    .index("by_name", ["name"]),

  medicalCenters: defineTable({
    name: v.string(),
    address: v.string(),
    city: v.string(),
    phone: v.optional(v.string()),
    createdBy: v.string(), // Clerk user ID
    createdAt: v.number(),
  })
    .index("by_createdBy", ["createdBy"])
    .index("by_name", ["name"]),

  visits: defineTable({
    doctorId: v.id("doctors"),
    visitorId: v.string(), // Clerk user ID
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
    status: v.union(
      v.literal("completed"),
      v.literal("pending"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
  })
    .index("by_visitorId", ["visitorId"])
    .index("by_doctorId", ["doctorId"])
    .index("by_date", ["date"]),

  medications: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    unit: v.union(
      v.literal("units"),
      v.literal("boxes"),
      v.literal("samples")
    ),
    createdBy: v.string(), // Clerk user ID
    createdAt: v.number(),
  })
    .index("by_createdBy", ["createdBy"])
    .index("by_name", ["name"]),

  userProfiles: defineTable({
    userId: v.string(), // Clerk user ID
    role: v.union(v.literal("admin"), v.literal("visitor")),
    name: v.optional(v.string()),
    assignedDoctors: v.optional(v.array(v.id("doctors"))),
    assignedMedications: v.optional(v.array(v.id("medications"))),
    assignedMedicalCenters: v.optional(v.array(v.id("medicalCenters"))),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  activityLogs: defineTable({
    userId: v.string(), // Clerk user ID
    action: v.string(),
    entityType: v.string(),
    entityId: v.optional(v.string()),
    details: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_createdAt", ["createdAt"]),
});
