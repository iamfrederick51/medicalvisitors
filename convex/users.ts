import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { auth } from "./auth";

// Obtener todos los usuarios (visitadores)
// Versión optimizada para evitar timeouts
export const list = query({
  args: {},
  handler: async (ctx) => {
    // Obtener todos los perfiles de visitadores (limitado a 100 para evitar timeouts)
    const profiles = await ctx.db
      .query("userProfiles")
      .collect();
    
    // Si no hay perfiles, retornar array vacío
    if (profiles.length === 0) {
      return [];
    }
    
    // Limitar el número de perfiles procesados para evitar timeouts
    const limitedProfiles = profiles.slice(0, 100);
    
    // Obtener todos los IDs únicos de doctores y medicamentos
    const allDoctorIds = new Set<Id<"doctors">>();
    const allMedicationIds = new Set<Id<"medications">>();
    
    limitedProfiles.forEach(profile => {
      profile.assignedDoctors?.forEach(id => allDoctorIds.add(id));
      profile.assignedMedications?.forEach(id => allMedicationIds.add(id));
    });
    
    // Hacer batch queries para doctores y medicamentos (limitado a 50 cada uno)
    const doctorsMap = new Map();
    const medicationsMap = new Map();
    
    const doctorIdsArray = Array.from(allDoctorIds).slice(0, 50);
    const medicationIdsArray = Array.from(allMedicationIds).slice(0, 50);
    
    // Procesar en lotes más pequeños para evitar timeouts
    const batchSize = 10;
    for (let i = 0; i < doctorIdsArray.length; i += batchSize) {
      const batch = doctorIdsArray.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (id) => {
          const doctor = await ctx.db.get(id);
          if (doctor) doctorsMap.set(id, doctor);
        })
      );
    }
    
    for (let i = 0; i < medicationIdsArray.length; i += batchSize) {
      const batch = medicationIdsArray.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (id) => {
          const medication = await ctx.db.get(id);
          if (medication) medicationsMap.set(id, medication);
        })
      );
    }
    
    // Enriquecer con información del usuario (procesar en lotes)
    const usersWithDetails = [];
    for (let i = 0; i < limitedProfiles.length; i += batchSize) {
      const batch = limitedProfiles.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (profile) => {
          const user = await ctx.db.get(profile.userId);
          
          // Obtener doctores asignados del mapa
          const assignedDoctors = profile.assignedDoctors 
            ? profile.assignedDoctors
                .map(id => doctorsMap.get(id))
                .filter(d => d !== undefined)
            : [];
          
          // Obtener medicamentos asignados del mapa
          const assignedMedications = profile.assignedMedications
            ? profile.assignedMedications
                .map(id => medicationsMap.get(id))
                .filter(m => m !== undefined)
            : [];
          
          return {
            ...profile,
            user: user ? {
              _id: user._id,
              username: (user as any)?.email || null, // Usar username en lugar de email
            } : null,
            assignedDoctors,
            assignedMedications,
          };
        })
      );
      usersWithDetails.push(...batchResults);
    }
    
    return usersWithDetails;
  },
});

// Crear usuario con contraseña
// Esta función crea el usuario usando Convex Auth y asigna el rol y las asignaciones
export const create = mutation({
  args: {
    username: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("visitor")), // Requerido, no opcional
    assignedDoctors: v.optional(v.array(v.id("doctors"))),
    assignedMedications: v.optional(v.array(v.id("medications"))),
  },
  handler: async (ctx, args) => {
    // El usuario ya fue creado desde el cliente usando signIn con flow: "signUp"
    // Solo necesitamos encontrar el usuario y crear/actualizar su perfil
    
    // Verificar si el usuario existe (usando username como email para Convex Auth)
    const existingUsers = await ctx.db
      .query("users")
      .collect();
    
    const existingUser = existingUsers.find(
      (u) => ((u as any)?.email?.toLowerCase() || "") === args.username.toLowerCase()
    );
    
    if (!existingUser) {
      throw new Error(`Usuario no encontrado: ${args.username}. Asegúrate de que el usuario fue creado primero.`);
    }
    
    const userId = existingUser._id;
    
    // Crear o actualizar perfil de usuario
    let profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    const finalRole = args.role;
    const finalAssignedDoctors = args.assignedDoctors || [];
    const finalAssignedMedications = args.assignedMedications || [];
    const isNewProfile = !profile;
    
    if (profile) {
      // Actualizar perfil existente
      await ctx.db.patch(profile._id, {
        name: args.name !== undefined ? args.name : profile.name,
        role: finalRole, // Siempre actualizar el rol
        assignedDoctors: finalAssignedDoctors,
        assignedMedications: finalAssignedMedications,
      });
    } else {
      // Crear nuevo perfil
      await ctx.db.insert("userProfiles", {
        userId,
        role: finalRole,
        name: args.name,
        assignedDoctors: finalAssignedDoctors,
        assignedMedications: finalAssignedMedications,
        createdAt: Date.now(),
      });
    }
    
    // Registrar actividad
    const currentUserId = await getAuthUserId(ctx);
    if (currentUserId) {
      await ctx.db.insert("activityLogs", {
        userId: currentUserId,
        action: isNewProfile ? "create_user_profile" : "update_user_profile",
        entityType: "user",
        entityId: userId.toString(),
        details: `${isNewProfile ? "Created" : "Updated"} user profile: ${args.username} with role: ${finalRole}`,
        createdAt: Date.now(),
      });
    }
    
    return { 
      userId, 
      success: true, 
      message: isNewProfile
        ? "Usuario y perfil creados exitosamente. El usuario puede iniciar sesión ahora." 
        : "Perfil de usuario actualizado exitosamente." 
    };
  },
});

// Actualizar asignaciones de doctores y medicamentos
export const updateAssignments = mutation({
  args: {
    userId: v.id("users"),
    assignedDoctors: v.optional(v.array(v.id("doctors"))),
    assignedMedications: v.optional(v.array(v.id("medications"))),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!profile) {
      throw new Error("User profile not found");
    }
    
    const updates: any = {};
    if (args.assignedDoctors !== undefined) {
      updates.assignedDoctors = args.assignedDoctors;
    }
    if (args.assignedMedications !== undefined) {
      updates.assignedMedications = args.assignedMedications;
    }
    
    await ctx.db.patch(profile._id, updates);
    
    // Registrar actividad
    const currentUserId = await getAuthUserId(ctx);
    if (currentUserId) {
      await ctx.db.insert("activityLogs", {
        userId: currentUserId,
        action: "update_assignments",
        entityType: "user",
        details: `Updated assignments for user: ${args.userId}`,
        createdAt: Date.now(),
      });
    }
    
    return { success: true };
  },
});

// Eliminar usuario (elimina el perfil, no el usuario de auth)
export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Buscar y eliminar el perfil de usuario
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!profile) {
      throw new Error("User profile not found");
    }
    
    // Obtener información del usuario antes de eliminar para el log
    const user = await ctx.db.get(args.userId);
    const username = (user as any)?.email || "unknown";
    
    // Eliminar el perfil
    await ctx.db.delete(profile._id);
    
    // Registrar actividad
    const currentUserId = await getAuthUserId(ctx);
    if (currentUserId) {
      await ctx.db.insert("activityLogs", {
        userId: currentUserId,
        action: "delete_user",
        entityType: "user",
        entityId: args.userId.toString(),
        details: `Deleted user profile: ${username}`,
        createdAt: Date.now(),
      });
    }
    
    return { success: true };
  },
});

