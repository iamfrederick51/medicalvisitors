"use client";

import { useState, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { User, Stethoscope, Pill, Trash2 } from "lucide-react";

interface VisitorItemProps {
  visitor: any;
  isEditing: boolean;
  initialDoctors: Id<"doctors">[];
  initialMedications: Id<"medications">[];
  doctors: any[];
  medications: any[];
  onEdit: () => void;
  onSave: (userId: Id<"users">, doctors: Id<"doctors">[], medications: Id<"medications">[]) => void;
  onDelete: (userId: Id<"users">) => void;
  toggleDoctor: (id: Id<"doctors">, list: Id<"doctors">[]) => Id<"doctors">[];
  toggleMedication: (id: Id<"medications">, list: Id<"medications">[]) => Id<"medications">[];
}

export function VisitorItem({
  visitor,
  isEditing,
  initialDoctors,
  initialMedications,
  doctors,
  medications,
  onEdit,
  onSave,
  onDelete,
  toggleDoctor,
  toggleMedication,
}: VisitorItemProps) {
  const [editDoctors, setEditDoctors] = useState<Id<"doctors">[]>(initialDoctors);
  const [editMedications, setEditMedications] = useState<Id<"medications">[]>(initialMedications);

  // Actualizar estados cuando cambia isEditing
  useEffect(() => {
    if (isEditing) {
      setEditDoctors(initialDoctors);
      setEditMedications(initialMedications);
    }
  }, [isEditing, initialDoctors, initialMedications]);

  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">
              {visitor.name || visitor.user?.username || "Sin nombre"}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <User className="w-4 h-4" />
            <span>Usuario: {visitor.user?.username || "Sin usuario"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
          >
            {isEditing ? "Cancelar" : "Editar Asignaciones"}
          </button>
          <button
            onClick={() => onDelete(visitor.userId)}
            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar usuario"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4 mt-4">
          {/* Editar doctores */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doctores Asignados
            </label>
            <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
              {doctors.map((doctor) => (
                <label
                  key={doctor._id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={editDoctors.includes(doctor._id)}
                    onChange={() => setEditDoctors(toggleDoctor(doctor._id, editDoctors))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm">{doctor.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Editar medicamentos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medicamentos Asignados
            </label>
            <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
              {medications.map((medication) => (
                <label
                  key={medication._id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={editMedications.includes(medication._id)}
                    onChange={() => setEditMedications(toggleMedication(medication._id, editMedications))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm">{medication.name}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSave(visitor.userId, editDoctors, editMedications)}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Guardar Cambios
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Doctores asignados */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Doctores ({visitor.assignedDoctors?.length || 0})</span>
            </div>
            <div className="space-y-1">
              {visitor.assignedDoctors && visitor.assignedDoctors.length > 0 ? (
                visitor.assignedDoctors.map((doctor: any) => (
                  <div key={doctor._id} className="text-sm text-gray-600 pl-6">
                    • {doctor.name}
                  </div>
                ))
              ) : (
                <span className="text-sm text-gray-400 pl-6">Ningún doctor asignado</span>
              )}
            </div>
          </div>

          {/* Medicamentos asignados */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Pill className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Medicamentos ({visitor.assignedMedications?.length || 0})</span>
            </div>
            <div className="space-y-1">
              {visitor.assignedMedications && visitor.assignedMedications.length > 0 ? (
                visitor.assignedMedications.map((medication: any) => (
                  <div key={medication._id} className="text-sm text-gray-600 pl-6">
                    • {medication.name}
                  </div>
                ))
              ) : (
                <span className="text-sm text-gray-400 pl-6">Ningún medicamento asignado</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

