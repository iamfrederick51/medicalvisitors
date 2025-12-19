"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { VisitorItem } from "@/components/VisitorItem";
import { X } from "lucide-react";

interface UserAssignmentsModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
  onSave: (userId: string, doctors: Id<"doctors">[], medications: Id<"medications">[], medicalCenters: Id<"medicalCenters">[]) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
  toggleDoctor: (id: Id<"doctors">, list: Id<"doctors">[]) => Id<"doctors">[];
  toggleMedication: (id: Id<"medications">, list: Id<"medications">[]) => Id<"medications">[];
  toggleMedicalCenter: (id: Id<"medicalCenters">, list: Id<"medicalCenters">[]) => Id<"medicalCenters">[];
}

export function UserAssignmentsModal({
  userId,
  userName,
  onClose,
  onSave,
  onDelete,
  toggleDoctor,
  toggleMedication,
  toggleMedicalCenter,
}: UserAssignmentsModalProps) {
  // Cargar datos solo cuando el modal está abierto
  const doctors = useQuery(api.doctors.list, {});
  const medications = useQuery(api.medications.list, {});
  const medicalCenters = useQuery(api.medicalCenters.list, {});
  const convexProfile = useQuery(api.userProfiles.getByUserId, { userId });
  
  const initialDoctors = convexProfile?.assignedDoctors?.map(d => d._id) || [];
  const initialMedications = convexProfile?.assignedMedications?.map(m => m._id) || [];
  const initialMedicalCenters = convexProfile?.assignedMedicalCenters?.map(mc => mc._id) || [];

  if (!doctors || !medications || !medicalCenters) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-8">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-4">Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Editar Asignaciones
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {userName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-8">
          <VisitorItem
            visitor={{
              userId,
              role: "visitor",
              name: userName,
              assignedDoctors: initialDoctors.map(id => ({ _id: id })),
              assignedMedications: initialMedications.map(id => ({ _id: id })),
              assignedMedicalCenters: initialMedicalCenters.map(id => ({ _id: id })),
            } as any}
            isEditing={true}
            initialDoctors={initialDoctors}
            initialMedications={initialMedications}
            initialMedicalCenters={initialMedicalCenters}
            doctors={doctors}
            medications={medications}
            medicalCenters={medicalCenters}
            onEdit={onClose}
            onSave={onSave}
            onDelete={onDelete}
            toggleDoctor={toggleDoctor}
            toggleMedication={toggleMedication}
            toggleMedicalCenter={toggleMedicalCenter}
          />
        </div>
      </div>
    </div>
  );
}

