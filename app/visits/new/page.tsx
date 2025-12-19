"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { LanguageToggle } from "@/components/LanguageToggle";
import { DoctorSelector } from "@/components/DoctorSelector";
import { MedicalCenterDisplay } from "@/components/MedicalCenterDisplay";
import { MedicationInput } from "@/components/MedicationInput";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function NewVisitContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const createVisit = useMutation(api.visits.create);
  const currentAssignments = useQuery(api.userProfiles.getCurrentAssignments);
  const allDoctors = useQuery(api.doctors.list);
  const allMedications = useQuery(api.medications.list);
  const allMedicalCenters = useQuery(api.medicalCenters.list);

  // Filtrar doctores, medicamentos y centros médicos según asignaciones del visitador
  const doctors = currentAssignments?.assignedDoctors 
    ? allDoctors?.filter(d => currentAssignments.assignedDoctors.some(ad => ad._id === d._id)) || []
    : allDoctors || [];
  
  const medications = currentAssignments?.assignedMedications
    ? allMedications?.filter(m => currentAssignments.assignedMedications.some(am => am._id === m._id)) || []
    : allMedications || [];
  
  const medicalCenters = currentAssignments?.assignedMedicalCenters
    ? allMedicalCenters?.filter(mc => currentAssignments.assignedMedicalCenters.some(amc => amc._id === mc._id)) || []
    : allMedicalCenters || [];
  
  const [doctorId, setDoctorId] = useState<Id<"doctors"> | undefined>();
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedMedicalCenterId, setSelectedMedicalCenterId] = useState<Id<"medicalCenters"> | "">("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedMedications, setSelectedMedications] = useState<
    Array<{ medicationId: Id<"medications">; quantity: number; notes?: string }>
  >([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"completed" | "pending" | "cancelled">("completed");
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor(doctor);
    setSelectedMedicalCenterId(""); // Resetear centro médico al cambiar doctor
  };

  // Obtener centros médicos disponibles (ya filtrados por asignaciones, pero también del doctor seleccionado si aplica)
  const availableCenters = selectedDoctor?.medicalCenters 
    ? medicalCenters.filter(center => 
        selectedDoctor.medicalCenters.includes(center._id)
      )
    : medicalCenters;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || selectedMedications.length === 0) {
      alert("Por favor selecciona un doctor y al menos un medicamento");
      return;
    }

    setIsSubmitting(true);
    try {
      await createVisit({
        doctorId,
        date: new Date(date).getTime(),
        medicalCenterId: selectedMedicalCenterId || undefined,
        medications: selectedMedications,
        notes: notes || undefined,
        status,
      });
      router.push("/visits");
    } catch (error) {
      console.error("Error creating visit:", error);
      alert("Error al crear la visita");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Link
                href="/visits"
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-800">
                {t("visits.createVisit")}
              </h1>
            </div>
            <LanguageToggle />
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <DoctorSelector
              value={doctorId}
              onChange={setDoctorId}
              onDoctorSelect={handleDoctorSelect}
            />

            {selectedDoctor && availableCenters.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Centro Médico
                </label>
                <select
                  value={selectedMedicalCenterId}
                  onChange={(e) => setSelectedMedicalCenterId(e.target.value as Id<"medicalCenters">)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar centro médico</option>
                  {availableCenters.map((center) => (
                    <option key={center._id} value={center._id}>
                      {center.name} - {center.city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("visits.selectDate")}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("visits.status")}
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "completed" | "pending" | "cancelled")
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="completed">{t("visits.completed")}</option>
                <option value="pending">{t("visits.pending")}</option>
                <option value="cancelled">{t("visits.cancelled")}</option>
              </select>
            </div>

            <MedicationInput value={selectedMedications} onChange={setSelectedMedications} availableMedications={medications} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("visits.notes")} (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("visits.notes")}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t("common.loading") : t("visits.save")}
              </button>
              <Link
                href="/visits"
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
              >
                {t("visits.cancel")}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function NewVisitPage() {
  return <NewVisitContent />;
}

