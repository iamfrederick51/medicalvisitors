"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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
  const { t } = useLanguage();
  
  // Cargar queries críticas primero
  const recentVisits = useQuery(api.visits.getRecent, { limit: 5 });
  const doctors = useQuery(api.doctors.list);
  const availableMedications = useQuery(api.medications.list);
  const medicalCenters = useQuery(api.medicalCenters.list);
  // Lazy load: allVisits solo se carga cuando es necesario (para estadísticas)
  const allVisits = useQuery(api.visits.list);
  const createVisit = useMutation(api.visits.create);

  // Estados para el formulario de registro rápido
  const [doctorId, setDoctorId] = useState<Id<"doctors"> | undefined>();
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedMedicalCenterId, setSelectedMedicalCenterId] = useState<Id<"medicalCenters"> | "">("");
  const [selectedMedications, setSelectedMedications] = useState<Array<{ medicationId: Id<"medications">; quantity: number; notes?: string }>>([]);
  const [isMedicationSelectorOpen, setIsMedicationSelectorOpen] = useState(false);
  const [medicationSearchTerm, setMedicationSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fecha y hora actuales (fijas)
  const currentDate = new Date();
  const formattedDate = format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  const formattedTime = format(currentDate, "HH:mm");
  const dateTimeTimestamp = currentDate.getTime();

  // Calcular estadísticas de forma optimizada
  const stats = {
    totalVisits: allVisits?.length ?? 0,
    totalDoctors: doctors?.length ?? 0,
    totalMedications: availableMedications?.length ?? 0,
  };

  // Obtener centros médicos del doctor seleccionado
  const availableCenters = selectedDoctor?.medicalCenters 
    ? medicalCenters?.filter(center => 
        selectedDoctor.medicalCenters.includes(center._id)
      ) || []
    : [];

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
        medications: selectedMedications,
        status: "completed",
      });
      // Resetear formulario
      setDoctorId(undefined);
      setSelectedDoctor(null);
      setSelectedMedicalCenterId("");
      setSelectedMedications([]);
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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100">
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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100">
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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100">
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
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

                  <button
                    type="submit"
                    disabled={!doctorId || isSubmitting}
                    className="w-full bg-blue-400 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-500 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <Plus className="w-5 h-5" />
                    {isSubmitting ? "Registrando..." : "Registrar Cita"}
                  </button>
                </form>
              </div>
            </div>

            {/* Columna derecha: Visitas Recientes */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-6">
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
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
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
              <div className="space-y-3">
                {((recentVisits || []) as Array<{
                  _id: string;
                  date?: number;
                  status?: "completed" | "pending" | "cancelled";
                  doctor?: { name?: string; specialty?: string } | null;
                }>).map((visit) => {
                  const visitDate = visit.date;
                  const visitStatus = visit.status;
                  return (
                    <div
                      key={visit._id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 bg-white/50"
            >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {visit.doctor?.name || "Unknown Doctor"}
                          </h3>
                          {visitDate && (
                            <p className="text-sm text-gray-500 mt-1">
                              {format(new Date(visitDate), "PPP")}
                            </p>
                          )}
                          {visit.doctor?.specialty && (
                            <p className="text-sm text-gray-400 mt-1">
                              {visit.doctor.specialty}
                            </p>
                          )}
        </div>
                        {visitStatus && (
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                                visitStatus === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : visitStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {t(`visits.${visitStatus}`)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
