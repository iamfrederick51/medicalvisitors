"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChevronDown } from "lucide-react";

interface UserRoleDropdownProps {
  userId: string; // Clerk user ID
  currentRole: "admin" | "visitor";
  onRoleChange?: () => void;
}

export function UserRoleDropdown({ userId, currentRole, onRoleChange }: UserRoleDropdownProps) {
  const updateRole = useMutation(api.userProfiles.updateRole);
  const [isChanging, setIsChanging] = useState(false);
  const [role, setRole] = useState<"admin" | "visitor">(currentRole);

  // Sincronizar el estado local con el prop currentRole cuando cambie
  useEffect(() => {
    setRole(currentRole);
  }, [currentRole]);

  const handleRoleChange = async (newRole: "admin" | "visitor") => {
    if (newRole === role || isChanging) return;
    
    // Confirmar cambio si es de admin a visitor
    if (currentRole === "admin" && newRole === "visitor") {
      const confirmed = window.confirm(
        "¿Estás seguro de que deseas cambiar este usuario de Administrador a Visitador Médico? " +
        "El usuario perderá acceso al panel de administración."
      );
      if (!confirmed) {
        return;
      }
    }
    
    setIsChanging(true);
    const previousRole = role;
    setRole(newRole);
    
    try {
      // Actualizar en Clerk primero
      const response = await fetch("/api/admin/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          newRole,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar el rol");
      }

      // También actualizar en Convex (para mantener sincronización)
      try {
        await updateRole({
          userId,
          role: newRole,
        });
      } catch (convexError) {
        console.warn("Error updating role in Convex (non-critical):", convexError);
      }

      console.log(`[UserRoleDropdown] Role updated successfully from ${previousRole} to ${newRole}`);
      
      // Recargar la página para reflejar los cambios en Clerk
      window.location.reload();
    } catch (error: any) {
      console.error("Error updating role:", error);
      // Revertir el cambio si falla
      setRole(currentRole);
      alert("Error al actualizar el rol: " + (error.message || "Error desconocido"));
    } finally {
      setIsChanging(false);
    }
  };

  const getRoleLabel = (role: "admin" | "visitor") => {
    return role === "admin" ? "Administrador" : "Visitador Médico";
  };

  const getRoleBadgeColor = (role: "admin" | "visitor") => {
    return role === "admin" 
      ? "bg-purple-100 text-purple-700 border-purple-200" 
      : "bg-blue-100 text-blue-700 border-blue-200";
  };

  return (
    <div className="relative">
      <select
        value={role}
        onChange={(e) => handleRoleChange(e.target.value as "admin" | "visitor")}
        disabled={isChanging}
        className={`
          appearance-none bg-white border-2 rounded-xl px-4 py-2.5 pr-10
          font-medium text-sm cursor-pointer transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${getRoleBadgeColor(role)}
          hover:shadow-md active:scale-95
        `}
      >
        <option value="visitor">Visitador Médico</option>
        <option value="admin">Administrador</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
  );
}

