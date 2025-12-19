"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { UserRoleDropdown } from "@/components/UserRoleDropdown";
import { UserAssignmentsModal } from "@/components/UserAssignmentsModal";
import { Users, Trash2, Settings } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";

interface ClerkUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: "admin" | "visitor";
  createdAt: number;
  imageUrl?: string;
}

function UsersContent() {
  const updateAssignments = useMutation(api.users.updateAssignments);
  const deleteUserMutation = useMutation(api.users.deleteUser);

  const [clerkUsers, setClerkUsers] = useState<ClerkUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Cargar usuarios de Clerk
  useEffect(() => {
    let cancelled = false;
    
    async function loadUsers() {
      try {
        setIsLoadingUsers(true);
        const response = await fetch("/api/admin/list-users", {
          cache: "no-store", // Evitar cache para obtener datos frescos
        });
        
        if (cancelled) return;
        
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) {
            setClerkUsers(data.users || []);
          }
        } else {
          const errorText = await response.text();
          console.error("Error loading users:", errorText);
          if (!cancelled) {
            // No mostrar alerta, solo log
            console.error("Failed to load users:", errorText);
          }
        }
      } catch (error) {
        console.error("Error loading users:", error);
        if (!cancelled) {
          console.error("Connection error:", error);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingUsers(false);
        }
      }
    }
    
    loadUsers();
    
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpdateAssignments = async (userId: string, doctors: Id<"doctors">[], medications: Id<"medications">[], medicalCenters: Id<"medicalCenters">[]) => {
    try {
      await updateAssignments({
        userId,
        assignedDoctors: doctors,
        assignedMedications: medications,
        assignedMedicalCenters: medicalCenters,
      });
      setEditingUserId(null);
      alert("Asignaciones actualizadas exitosamente");
    } catch (error: any) {
      console.error("Error updating assignments:", error);
      alert("Error al actualizar asignaciones: " + (error.message || "Error desconocido"));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
    );
    
    if (!confirmed) {
      return;
    }
    
    try {
      await deleteUserMutation({ userId });
      alert("Usuario eliminado exitosamente");
      if (editingUserId === userId) {
        setEditingUserId(null);
      }
      // Recargar usuarios
      const response = await fetch("/api/admin/list-users");
      if (response.ok) {
        const data = await response.json();
        setClerkUsers(data.users || []);
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      alert("Error al eliminar usuario: " + (error.message || "Error desconocido"));
    }
  };

  const toggleDoctor = (doctorId: Id<"doctors">, currentList: Id<"doctors">[]) => {
    if (currentList.includes(doctorId)) {
      return currentList.filter(id => id !== doctorId);
    } else {
      return [...currentList, doctorId];
    }
  };

  const toggleMedication = (medicationId: Id<"medications">, currentList: Id<"medications">[]) => {
    if (currentList.includes(medicationId)) {
      return currentList.filter(id => id !== medicationId);
    } else {
      return [...currentList, medicationId];
    }
  };

  const toggleMedicalCenter = (centerId: Id<"medicalCenters">, currentList: Id<"medicalCenters">[]) => {
    if (currentList.includes(centerId)) {
      return currentList.filter(id => id !== centerId);
    } else {
      return [...currentList, centerId];
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tabla de usuarios - Diseño profesional */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
            GESTIÓN DE USUARIOS
          </h2>
          <h1 className="text-3xl font-bold text-gray-900">
            Usuarios del sistema
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Administre los usuarios del sistema y asigne roles: Administrador o Visitador Médico.
          </p>
        </div>
        
        {isLoadingUsers ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-4">Cargando usuarios...</p>
          </div>
        ) : clerkUsers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    USUARIO
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    EMAIL
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ROL
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    FECHA DE REGISTRO
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ACCIONES
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {clerkUsers.map((clerkUser) => {
                  const isEditing = editingUserId === clerkUser.id;
                  
                  // Formatear fecha
                  const formattedDate = clerkUser.createdAt 
                    ? format(new Date(clerkUser.createdAt), "d MMM yyyy", { locale: es })
                    : "N/A";
                  
                  // Obtener iniciales para avatar
                  const name = clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}`.trim() || clerkUser.email || "Usuario";
                  const initials = name
                    .split(" ")
                    .map(n => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  
                  // Color del avatar basado en el rol
                  const avatarColor = clerkUser.role === "admin" 
                    ? "bg-gradient-to-br from-purple-500 to-purple-600" 
                    : "bg-gradient-to-br from-blue-500 to-blue-600";

                  return (
                    <tr 
                      key={clerkUser.id} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      {/* Usuario con Avatar */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          {clerkUser.imageUrl ? (
                            <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-200">
                              <Image
                                src={clerkUser.imageUrl}
                                alt={name}
                                width={48}
                                height={48}
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className={`${avatarColor} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                              {initials}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              {name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {clerkUser.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Email */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {clerkUser.email || "N/A"}
                        </div>
                      </td>
                      
                      {/* Rol con Dropdown */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <UserRoleDropdown
                          userId={clerkUser.id}
                          currentRole={clerkUser.role}
                          onRoleChange={() => {
                            // Recargar usuarios después del cambio
                            const reloadUsers = async () => {
                              const response = await fetch("/api/admin/list-users");
                              if (response.ok) {
                                const data = await response.json();
                                setClerkUsers(data.users || []);
                              }
                            };
                            reloadUsers();
                          }}
                        />
                      </td>
                      
                      {/* Fecha de Registro */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formattedDate}
                        </div>
                      </td>
                      
                      {/* Acciones */}
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {clerkUser.role === "visitor" && (
                            <button
                              onClick={() => {
                                if (isEditing) {
                                  setEditingUserId(null);
                                } else {
                                  setEditingUserId(clerkUser.id);
                                }
                              }}
                              className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                              title="Editar Asignaciones"
                            >
                              <Settings className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(clerkUser.id)}
                            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 font-medium text-sm"
                            title="Eliminar Usuario"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Modal de edición de asignaciones */}
        {editingUserId && (() => {
          const clerkUser = clerkUsers.find(u => u.id === editingUserId);
          if (!clerkUser || clerkUser.role !== "visitor") return null;
          
          return (
            <UserAssignmentsModal
              userId={clerkUser.id}
              userName={clerkUser.fullName || clerkUser.email}
              onClose={() => setEditingUserId(null)}
              onSave={handleUpdateAssignments}
              onDelete={handleDeleteUser}
              toggleDoctor={toggleDoctor}
              toggleMedication={toggleMedication}
              toggleMedicalCenter={toggleMedicalCenter}
            />
          );
        })()}
      </div>
    </div>
  );
}

export default function UsersPage() {
  return <UsersContent />;
}
