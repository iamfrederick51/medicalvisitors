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
    
    // Si es admin, mostrar todos los medicamentos
    if (role === "admin") {
      const limit = Math.min(args.limit ?? 1000, 5000);
      return await ctx.db.query("medications").take(limit);
    }
    
    // Si es visitador, obtener perfil para ver asignaciones
    if (role === "visitor") {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
      
      if (profile?.assignedMedications && profile.assignedMedications.length > 0) {
        const assignedMedications = await Promise.all(
          profile.assignedMedications.map(async (medicationId) => {
            return await ctx.db.get(medicationId);
          })
        );
        return assignedMedications.filter((m): m is NonNullable<typeof m> => m !== null);
      }
    }
    
    // Si no hay asignaciones o no es visitador, retornar array vacío
    return [];
  },
});

export const get = query({
  args: { id: v.id("medications") },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
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
    console.log("[medications.create] Starting medication creation with args:", {
      name: args.name,
      description: args.description ? "provided" : "not provided",
      unit: args.unit,
    });

    try {
      // Paso 1: Obtener userId
      console.log("[medications.create] Step 1: Getting authenticated user...");
      const userId = await getClerkUserId(ctx);
      
      if (!userId) {
        console.error("[medications.create] ❌ Authentication failed: userId is null");
        throw new Error("Not authenticated. Please log in again.");
      }
      
      console.log("[medications.create] ✅ User authenticated. userId:", userId);
      
      // Validar que el usuario sea admin
      const role = await getUserRole(ctx);
      if (role !== "admin") {
        console.error("[medications.create] ❌ Authorization failed: User is not admin. Role:", role);
        throw new Error("Only admins can create medications");
      }
      
      console.log("[medications.create] ✅ User is admin. Proceeding with creation...");
      
      // Paso 2: Validar datos de entrada
      console.log("[medications.create] Step 2: Validating input data...");
      if (!args.name || args.name.trim() === "") {
        console.error("[medications.create] ❌ Validation failed: name is empty");
        throw new Error("El nombre del medicamento es requerido");
      }
      
      const trimmedName = args.name.trim();
      const trimmedDescription = args.description?.trim() || undefined;
      
      console.log("[medications.create] ✅ Input validated:", {
        name: trimmedName,
        description: trimmedDescription ? "provided" : "not provided",
        unit: args.unit,
      });
      
      // Paso 3: Preparar datos para inserción
      const medicationData = {
        name: trimmedName,
        description: trimmedDescription,
        unit: args.unit,
        createdBy: userId,
        createdAt: Date.now(),
      };
      
      console.log("[medications.create] Step 3: Inserting medication into database...");
      console.log("[medications.create] Medication data:", medicationData);
      
      // Paso 4: Insertar en la base de datos
      const medicationId = await ctx.db.insert("medications", medicationData);
      console.log("[medications.create] ✅ Medication inserted. ID:", medicationId);
      
      // Paso 5: Verificar que se insertó correctamente
      console.log("[medications.create] Step 4: Verifying insertion...");
      const inserted = await ctx.db.get(medicationId);
      
      if (!inserted) {
        console.error("[medications.create] ❌ Verification failed: Medication not found after insertion");
        throw new Error("Error al guardar el medicamento en la base de datos. El medicamento no se encontró después de la inserción.");
      }
      
      console.log("[medications.create] ✅ Verification successful. Medication saved:", {
        id: inserted._id,
        name: inserted.name,
        unit: inserted.unit,
        createdBy: inserted.createdBy,
      });
      
      return medicationId;
    } catch (error: any) {
      console.error("[medications.create] ❌ Error creating medication:", {
        error: error,
        message: error?.message,
        stack: error?.stack,
        args: args,
      });
      
      // Si el error ya tiene un mensaje descriptivo, lanzarlo tal cual
      if (error.message && (
        error.message.includes("Not authenticated") ||
        error.message.includes("Only admins") ||
        error.message.includes("requerido") ||
        error.message.includes("Error al guardar")
      )) {
        throw error;
      }
      
      // Para otros errores, proporcionar un mensaje más descriptivo
      const errorMessage = error?.message || "Error desconocido";
      console.error("[medications.create] ❌ Throwing error:", errorMessage);
      throw new Error(`Error al crear el medicamento: ${errorMessage}`);
    }
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
    console.log("[medications.update] Starting medication update with args:", {
      id: args.id,
      name: args.name,
      description: args.description ? "provided" : "not provided",
      unit: args.unit,
    });

    try {
      const userId = await getClerkUserId(ctx);
      if (!userId) {
        console.error("[medications.update] ❌ Authentication failed: userId is null");
        throw new Error("Not authenticated");
      }
      
      console.log("[medications.update] ✅ User authenticated. userId:", userId);
      
      // Verificar si el usuario es admin
      const role = await getUserRole(ctx);
      const isAdmin = role === "admin";
      console.log("[medications.update] User role:", isAdmin ? "admin" : "visitor");
      
      const medication = await ctx.db.get(args.id);
      if (!medication) {
        console.error("[medications.update] ❌ Medication not found. ID:", args.id);
        throw new Error("Medication not found");
      }
      
      // Si no es admin, solo puede actualizar medicamentos que creó
      if (!isAdmin && medication.createdBy !== userId) {
        console.error("[medications.update] ❌ Unauthorized: User is not admin and did not create this medication");
        throw new Error("Not authorized to update this medication");
      }
      
      const updates: any = {};
      if (args.name !== undefined) updates.name = args.name.trim();
      if (args.description !== undefined) updates.description = args.description.trim() || undefined;
      if (args.unit !== undefined) updates.unit = args.unit;
      
      console.log("[medications.update] Updating medication with:", updates);
      await ctx.db.patch(args.id, updates);
      
      // Verificar que se actualizó correctamente
      const updated = await ctx.db.get(args.id);
      if (!updated) {
        console.error("[medications.update] ❌ Verification failed: Medication not found after update");
        throw new Error("Error al actualizar el medicamento. No se encontró después de la actualización.");
      }
      
      console.log("[medications.update] ✅ Medication updated successfully:", {
        id: updated._id,
        name: updated.name,
        unit: updated.unit,
      });
    } catch (error: any) {
      console.error("[medications.update] ❌ Error updating medication:", {
        error: error,
        message: error?.message,
        stack: error?.stack,
      });
      throw error;
    }
  },
});

export const deleteMedication = mutation({
  args: {
    id: v.id("medications"),
  },
  handler: async (ctx, args) => {
    const userId = await getClerkUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    
    // Verificar si es admin
    const role = await getUserRole(ctx);
    
    const medication = await ctx.db.get(args.id);
    if (!medication) {
      throw new Error("Medication not found");
    }
    
    // Solo el creador o un admin puede eliminar
    if (medication.createdBy !== userId && role !== "admin") {
      throw new Error("Not authorized to delete this medication");
    }
    
    await ctx.db.delete(args.id);
  },
});

