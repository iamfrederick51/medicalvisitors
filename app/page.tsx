"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { LanguageToggle } from "@/components/LanguageToggle";
import { DoctorSelector } from "@/components/DoctorSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Users, Pill, Clock, Plus, X, Search } from "lucide-react";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

function DashboardContent() {
  // IMPORTANTE: Todos los hooks deben llamarse ANTES de cualquier early return
  // para mantener la consistencia del orden de hooks entre renders
  
  const { t } = useLanguage();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  // Cargar queries críticas primero - TODOS los hooks deben estar aquí
  const recentVisits = useQuery(api.visits.getRecentByVisitor, { limit: 10 });
  const currentAssignments = useQuery(api.userProfiles.getCurrentAssignments);
  const allDoctors = useQuery(api.doctors.list);
  const allMedications = useQuery(api.medications.list);
  const allMedicalCenters = useQuery(api.medicalCenters.list);
  // Lazy load: allVisits solo se carga cuando es necesario (para estadísticas)
  const allVisits = useQuery(api.visits.list);
  const createVisit = useMutation(api.visits.create);

  // Estados para el formulario de registro rápido - TODOS los useState deben estar aquí
  const [doctorId, setDoctorId] = useState<Id<"doctors"> | undefined>();
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedMedicalCenterId, setSelectedMedicalCenterId] = useState<Id<"medicalCenters"> | "">("");
  const [selectedMedications, setSelectedMedications] = useState<Array<{ medicationId: Id<"medications">; quantity: number; notes?: string }>>([]);
  const [notes, setNotes] = useState("");
  const [isMedicationSelectorOpen, setIsMedicationSelectorOpen] = useState(false);
  const [medicationSearchTerm, setMedicationSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filtrar doctores, medicamentos y centros médicos según asignaciones del visitador
  const doctors = currentAssignments?.assignedDoctors 
    ? allDoctors?.filter(d => currentAssignments.assignedDoctors.some(ad => ad._id === d._id)) || []
    : allDoctors || [];
  
  const availableMedications = currentAssignments?.assignedMedications
    ? allMedications?.filter(m => currentAssignments.assignedMedications.some(am => am._id === m._id)) || []
    : allMedications || [];
  
  const medicalCenters = currentAssignments?.assignedMedicalCenters
    ? allMedicalCenters?.filter(mc => currentAssignments.assignedMedicalCenters.some(amc => amc._id === mc._id)) || []
    : allMedicalCenters || [];
  
  // El middleware se encarga de redirigir admins a /admin
  // No necesitamos hacer redirect aquí durante el render

  // Fecha y hora actuales (fijas)
  const currentDate = new Date();
  const formattedDate = format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const formattedTime = format(currentDate, "HH:mm");
  const dateTimeTimestamp = currentDate.getTime();

  // Calcular estadísticas de forma optimizada (usar todas las listas, no las filtradas)
  const stats = {
    totalVisits: allVisits?.length ?? 0,
    totalDoctors: allDoctors?.length ?? 0,
    totalMedications: allMedications?.length ?? 0,
  };

  // Obtener centros médicos disponibles (ya filtrados por asignaciones, pero también del doctor seleccionado si aplica)
  const availableCenters = selectedDoctor?.medicalCenters 
    ? medicalCenters.filter(center => 
        selectedDoctor.medicalCenters.includes(center._id)
      )
    : medicalCenters;

  const handleDoctorSelect = (doctor: any) => {
    setSelectedDoctor(doctor);
    setSelectedMedicalCenterId(""); // Resetear centro médico al cambiar doctor
  };

  const handleSelectMedication = (medication: any) => {
    // Verificar si el medicamento ya está seleccionado
    const isAlreadySelected = selectedMedications.some(
      (med) => med.medicationId === medication._id
    );
    
    if (!isAlreadySelected) {
      setSelectedMedications([
        ...selectedMedications,
        {
          medicationId: medication._id,
          quantity: 1,
        },
      ]);
    }
    
    setIsMedicationSelectorOpen(false);
    setMedicationSearchTerm("");
  };

  const filteredMedications = availableMedications?.filter((medication) =>
    medication.name.toLowerCase().includes(medicationSearchTerm.toLowerCase())
  ) || [];

  const handleQuickVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createVisit({
        doctorId,
        date: dateTimeTimestamp,
        medicalCenterId: selectedMedicalCenterId || undefined,
        medications: selectedMedications,
        notes: notes || undefined,
        status: "completed",
      });
      // Resetear formulario
      setDoctorId(undefined);
      setSelectedDoctor(null);
      setSelectedMedicalCenterId("");
      setSelectedMedications([]);
      setNotes("");
      setMedicationSearchTerm("");
      // Recargar la página para mostrar la nueva visita
      window.location.reload();
    } catch (error) {
      console.error("Error creating visit:", error);
      alert("Error al crear la visita. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">
              Gestiona tus visitas médicas de forma eficiente
            </h1>
            <LanguageToggle />
          </div>

          {/* Statistics Cards - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:scale-105 active:scale-95">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    {t("dashboard.totalVisits")}
                  </p>
                  {allVisits === undefined ? (
                    <div className="h-10 w-16 bg-gray-200 animate-pulse rounded mt-2"></div>
                  ) : (
                    <p className="text-4xl font-semibold text-gray-900 mt-2">
                      {stats.totalVisits}
                    </p>
                  )}
                </div>
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:scale-105 active:scale-95">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    {t("dashboard.totalDoctors")}
                  </p>
                  {doctors === undefined ? (
                    <div className="h-10 w-16 bg-gray-200 animate-pulse rounded mt-2"></div>
                  ) : (
                    <p className="text-4xl font-semibold text-gray-900 mt-2">
                      {stats.totalDoctors}
                    </p>
                  )}
                </div>
                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                  <Users className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:scale-105 active:scale-95">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    {t("dashboard.totalMedications")}
                  </p>
                  {availableMedications === undefined ? (
                    <div className="h-10 w-16 bg-gray-200 animate-pulse rounded mt-2"></div>
                  ) : (
                    <p className="text-4xl font-semibold text-gray-900 mt-2">
                      {stats.totalMedications}
                    </p>
                  )}
                </div>
                <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center">
                  <Pill className="w-7 h-7 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Layout de dos columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna izquierda: Formulario */}
            <div className="lg:col-span-1">

              {/* Formulario de Registrar Cita Rápido */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-1 tracking-tight">
                  Registrar Cita
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Agrega una nueva visita medica
                </p>
                <form onSubmit={handleQuickVisitSubmit} className="space-y-4">
                  {/* Fecha fija */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      FECHA
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formattedDate}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-700 cursor-not-allowed focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Hora fija */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      HORA
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formattedTime}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-700 cursor-not-allowed focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Selector de médico */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      MÉDICO
                    </label>
                    <DoctorSelector
                      value={doctorId}
                      onChange={setDoctorId}
                      onDoctorSelect={handleDoctorSelect}
                    />
                  </div>

                  {/* Selector de centro médico */}
                  {selectedDoctor && availableCenters.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                        CENTRO MÉDICO
                      </label>
                      <select
                        value={selectedMedicalCenterId}
                        onChange={(e) => setSelectedMedicalCenterId(e.target.value as Id<"medicalCenters">)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none hover:border-gray-300"
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

                  {/* Medicamentos Entregados */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      MEDICAMENTOS ENTREGADOS
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsMedicationSelectorOpen(!isMedicationSelectorOpen)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-left flex items-center justify-between hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      >
                        <span className="flex items-center gap-2 text-gray-700">
                          <Pill className="w-4 h-4 text-gray-400" />
                          {selectedMedications.length > 0 
                            ? `${selectedMedications.length} medicamento${selectedMedications.length > 1 ? 's' : ''} seleccionado${selectedMedications.length > 1 ? 's' : ''}`
                            : "Seleccionar medicamento"}
                        </span>
                        <Search className="w-4 h-4 text-gray-400" />
                      </button>
                      {isMedicationSelectorOpen && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                          <div className="p-2 sticky top-0 bg-white border-b border-gray-100">
                            <input
                              type="text"
                              value={medicationSearchTerm}
                              onChange={(e) => setMedicationSearchTerm(e.target.value)}
                              placeholder="Buscar medicamento..."
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              autoFocus
                            />
                          </div>
                          <div className="py-1">
                            {filteredMedications.length === 0 ? (
                              <div className="px-4 py-2 text-gray-500 text-sm">
                                {availableMedications?.length === 0 
                                  ? "No hay medicamentos disponibles. Crea uno primero."
                                  : "No se encontraron medicamentos"}
                              </div>
                            ) : (
                              filteredMedications.map((medication) => {
                                const isSelected = selectedMedications.some(
                                  (med) => med.medicationId === medication._id
                                );
                                return (
                                  <button
                                    key={medication._id}
                                    type="button"
                                    onClick={() => handleSelectMedication(medication)}
                                    disabled={isSelected}
                                    className={`w-full px-4 py-2.5 text-left transition-colors rounded-lg mx-1 ${
                                      isSelected
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "hover:bg-blue-50"
                                    }`}
                                  >
                                    <div className="font-medium text-gray-900">{medication.name}</div>
                                    {medication.description && (
                                      <div className="text-sm text-gray-500">{medication.description}</div>
                                    )}
                                    {medication.unit && (
                                      <div className="text-xs text-gray-400">Unidad: {medication.unit}</div>
                                    )}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedMedications.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {selectedMedications.map((med, index) => {
                          const medication = availableMedications?.find((m) => m._id === med.medicationId);
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <span className="text-sm text-gray-700">
                                {medication?.name || "Medicamento"}
                              </span>
                              <button
                                type="button"
                                onClick={() => setSelectedMedications(selectedMedications.filter((_, i) => i !== index))}
                                className="text-red-600 hover:text-red-700 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Campo de notas opcional */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Notas (Opcional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
                      placeholder="Agregar notas sobre la visita..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!doctorId || isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-2xl font-semibold hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl"
                  >
                    <Plus className="w-5 h-5" />
                    {isSubmitting ? "Registrando..." : "Registrar Cita"}
                  </button>
                </form>
              </div>
            </div>

            {/* Columna derecha: Visitas Recientes */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                {t("dashboard.recentVisits")}
              </h2>
              <Link
                href="/visits/new"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 active:scale-95 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
              >
                {t("visits.newVisit")}
              </Link>
            </div>
            {recentVisits === undefined ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Visitador</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Doctor</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Hora</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Medicamentos</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Centro Médico</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="border-b border-gray-100 animate-pulse">
                        <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                        <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                        <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                        <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                        <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                        <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-36"></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : recentVisits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Calendar className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-500 text-center text-lg font-medium">
                  No hay visitas recientes
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Visitador</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Doctor</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Fecha</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Hora</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Medicamentos</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Centro Médico</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVisits.map((visit: any) => {
                      const visitDate = visit.date ? new Date(visit.date) : null;
                      const formattedDate = visitDate ? format(visitDate, "dd/MM/yyyy", { locale: es }) : "-";
                      const formattedTime = visitDate ? format(visitDate, "HH:mm", { locale: es }) : "-";
                      
                      return (
                        <tr 
                          key={visit._id} 
                          className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-150"
                        >
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-900">
                              {visit.visitor?.name || "N/A"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <span className="font-medium text-gray-900 block">
                                {visit.doctor?.name || "N/A"}
                              </span>
                              {visit.doctor?.specialty && (
                                <span className="text-xs text-gray-500">
                                  {visit.doctor.specialty}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-700">{formattedDate}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-700 font-medium">{formattedTime}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              {visit.medications && visit.medications.length > 0 ? (
                                visit.medications.map((med: any, idx: number) => (
                                  <div key={idx} className="text-sm text-gray-700">
                                    <span className="font-medium">{med.medication?.name || "N/A"}</span>
                                    <span className="text-gray-500 ml-2">
                                      (Cant: {med.quantity} {med.medication?.unit || ""})
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-gray-400 text-sm">Sin medicamentos</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {visit.medicalCenter ? (
                              <div>
                                <span className="font-medium text-gray-900 block">
                                  {visit.medicalCenter.name}
                                </span>
                                {visit.medicalCenter.city && (
                                  <span className="text-xs text-gray-500">
                                    {visit.medicalCenter.city}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">N/A</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
              </div>
            </div>
          </div>
        </div>
    </div>
    </ProtectedRoute>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
