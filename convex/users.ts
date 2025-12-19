import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getClerkUserId } from "./auth";
import { Id } from "./_generated/dataModel";

// Obtener todos los usuarios (visitadores)
// Versión optimizada para evitar timeouts
export const list = query({
  args: {},
  handler: async (ctx) => {
    // Usar take en lugar de collect para mejor rendimiento (limitado a 100 para evitar timeouts)
    const profiles = await ctx.db
      .query("userProfiles")
      .take(100);
    
    // Si no hay perfiles, retornar array vacío
    if (profiles.length === 0) {
      return [];
    }
    
    // Ya están limitados por take
    const limitedProfiles = profiles;
    
    // Obtener todos los IDs únicos de doctores, medicamentos y centros médicos
    const allDoctorIds = new Set<Id<"doctors">>();
    const allMedicationIds = new Set<Id<"medications">>();
    const allMedicalCenterIds = new Set<Id<"medicalCenters">>();
    
    limitedProfiles.forEach(profile => {
      profile.assignedDoctors?.forEach(id => allDoctorIds.add(id));
      profile.assignedMedications?.forEach(id => allMedicationIds.add(id));
      profile.assignedMedicalCenters?.forEach(id => allMedicalCenterIds.add(id));
    });
    
    // Hacer batch queries para doctores, medicamentos y centros médicos (limitado a 50 cada uno)
    const doctorsMap = new Map();
    const medicationsMap = new Map();
    const medicalCentersMap = new Map();
    
    const doctorIdsArray = Array.from(allDoctorIds).slice(0, 50);
    const medicationIdsArray = Array.from(allMedicationIds).slice(0, 50);
    const medicalCenterIdsArray = Array.from(allMedicalCenterIds).slice(0, 50);
    
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
    
    for (let i = 0; i < medicalCenterIdsArray.length; i += batchSize) {
      const batch = medicalCenterIdsArray.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (id) => {
          const medicalCenter = await ctx.db.get(id);
          if (medicalCenter) medicalCentersMap.set(id, medicalCenter);
        })
      );
    }
    
    // Enriquecer con información del usuario (procesar en lotes)
    const usersWithDetails = [];
    for (let i = 0; i < limitedProfiles.length; i += batchSize) {
      const batch = limitedProfiles.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (profile) => {
          // userId es un Clerk user ID (string), no un documento de Convex
          // La información del usuario (email, nombre) está en Clerk, no en Convex
          
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
          
          // Obtener centros médicos asignados del mapa
          const assignedMedicalCenters = profile.assignedMedicalCenters
            ? profile.assignedMedicalCenters
                .map(id => medicalCentersMap.get(id))
                .filter(mc => mc !== undefined)
            : [];
          
          return {
            ...profile,
            // userId es el Clerk user ID (string)
            // La información del usuario (email, nombre) viene de Clerk, no de Convex
            user: {
              clerkUserId: profile.userId,
              username: profile.name || null,
              email: null, // El email está en Clerk
            },
            assignedDoctors,
            assignedMedications,
            assignedMedicalCenters,
            // Incluir fecha de creación para formatear en el cliente
            createdAt: profile.createdAt,
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
    assignedMedicalCenters: v.optional(v.array(v.id("medicalCenters"))),
  },
  handler: async (ctx, args) => {
    // NOTA: Con Clerk, los usuarios se crean en Clerk, no en Convex
    // Esta función crea/actualiza el perfil en Convex para un usuario que ya existe en Clerk
    // El username debe ser el email del usuario en Clerk
    
    // Para crear un perfil para otro usuario (desde admin), necesitamos el clerkUserId
    // Por ahora, asumimos que el usuario autenticado es quien está creando su propio perfil
    // O que el admin está creando un perfil para un usuario que ya existe en Clerk
    const currentUserId = await getClerkUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated. Please sign in first.");
    }
    
    // TODO: Implementar lógica para que admin pueda crear perfiles para otros usuarios
    // Por ahora, solo creamos perfiles para el usuario autenticado
    // El username se usa para identificar al usuario, pero necesitamos el clerkUserId real
    const userId = currentUserId; // Temporal: solo para el usuario autenticado
    
    // Crear o actualizar perfil de usuario
    // Nota: En Convex, las operaciones de base de datos son atómicas, así que no necesitamos delays
    let profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    // Asegurar que el rol por defecto sea "visitor" si no se especifica o es inválido
    const finalRole = args.role || "visitor"; // Por defecto "visitor"
    const finalAssignedDoctors = args.assignedDoctors || [];
    const finalAssignedMedications = args.assignedMedications || [];
    const finalAssignedMedicalCenters = args.assignedMedicalCenters || [];
    const isNewProfile = !profile;
    
    // Validar que el rol sea válido
    if (finalRole !== "admin" && finalRole !== "visitor") {
      throw new Error(`Rol inválido: ${finalRole}. Debe ser "admin" o "visitor"`);
    }
    
    console.log(`[users.create] Creating/updating profile for user ${args.username} with role: ${finalRole}`);
    
    if (profile) {
      // Actualizar perfil existente - SIEMPRE actualizar el rol
      // Esto es importante porque el perfil podría haber sido creado por ensureUserProfile
      // con un rol por defecto, y necesitamos sobrescribirlo con el rol correcto del admin
      console.log(`[users.create] Updating existing profile ${profile._id}. Current role: ${profile.role}, New role: ${finalRole}`);
      
      // Actualizar el perfil
      await ctx.db.patch(profile._id, {
        name: args.name !== undefined ? args.name : profile.name,
        role: finalRole, // FORZAR actualización del rol (el admin tiene la autoridad final)
        assignedDoctors: finalAssignedDoctors,
        assignedMedications: finalAssignedMedications,
        assignedMedicalCenters: finalAssignedMedicalCenters,
      });
      
      // Verificar que se actualizó correctamente - leer directamente de la DB
      // En Convex, las operaciones son atómicas, así que podemos verificar inmediatamente
      const updatedProfile = await ctx.db.get(profile._id);
      if (!updatedProfile) {
        throw new Error("Error: Profile was deleted after update");
      }
      
      if (updatedProfile.role !== finalRole) {
        console.error(`[users.create] ERROR: Role not updated correctly. Expected: ${finalRole}, Got: ${updatedProfile.role}`);
        // Intentar actualizar de nuevo
        await ctx.db.patch(profile._id, { role: finalRole });
        const retryProfile = await ctx.db.get(profile._id);
        if (retryProfile?.role !== finalRole) {
          throw new Error(`Error al actualizar perfil: el rol no se actualizó correctamente. Esperado: ${finalRole}, Obtenido: ${retryProfile?.role}`);
        }
      }
      console.log(`[users.create] ✅ Profile updated successfully. Role: ${updatedProfile.role}`);
    } else {
      // Crear nuevo perfil con el rol especificado
      console.log(`[users.create] Creating new profile with role: ${finalRole}`);
      const newProfileId = await ctx.db.insert("userProfiles", {
        userId,
        role: finalRole, // Usar el rol del formulario
        name: args.name,
        assignedDoctors: finalAssignedDoctors,
        assignedMedications: finalAssignedMedications,
        assignedMedicalCenters: finalAssignedMedicalCenters,
        createdAt: Date.now(),
      });
      
      // Verificar que se creó correctamente
      // En Convex, las operaciones son atómicas, así que podemos verificar inmediatamente
      const createdProfile = await ctx.db.get(newProfileId);
      if (!createdProfile) {
        throw new Error("Error: Profile was not created");
      }
      
      if (createdProfile.role !== finalRole) {
        console.error(`[users.create] ERROR: Profile not created correctly. Expected role: ${finalRole}, Got: ${createdProfile.role}`);
        // Intentar actualizar el rol
        await ctx.db.patch(newProfileId, { role: finalRole });
        const retryProfile = await ctx.db.get(newProfileId);
        if (retryProfile?.role !== finalRole) {
          throw new Error(`Error al crear perfil: el rol no se guardó correctamente. Esperado: ${finalRole}, Obtenido: ${retryProfile?.role}`);
        }
      }
      console.log(`[users.create] ✅ Profile created successfully. Role: ${createdProfile.role}`);
    }
    
    // Registrar actividad
    if (currentUserId) {
      await ctx.db.insert("activityLogs", {
        userId: currentUserId,
        action: isNewProfile ? "create_user_profile" : "update_user_profile",
        entityType: "user",
        entityId: userId,
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

// Actualizar asignaciones de doctores, medicamentos y centros médicos
export const updateAssignments = mutation({
  args: {
    userId: v.string(),
    assignedDoctors: v.optional(v.array(v.id("doctors"))),
    assignedMedications: v.optional(v.array(v.id("medications"))),
    assignedMedicalCenters: v.optional(v.array(v.id("medicalCenters"))),
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
    if (args.assignedMedicalCenters !== undefined) {
      updates.assignedMedicalCenters = args.assignedMedicalCenters;
    }
    
    await ctx.db.patch(profile._id, updates);
    
    // Registrar actividad
    const currentUserId = await getClerkUserId(ctx);
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
    userId: v.string(),
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
    
    // userId es un Clerk user ID (string), la info del usuario está en Clerk
    const username = profile.name || args.userId;
    
    // Eliminar el perfil
    await ctx.db.delete(profile._id);
    
    // Registrar actividad
    const currentUserId = await getClerkUserId(ctx);
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

