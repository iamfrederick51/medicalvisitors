"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MedicalCenterDisplay } from "@/components/MedicalCenterDisplay";
import { Stethoscope, Plus, Edit2, Trash2, X, Mail, Phone, MapPin } from "lucide-react";

function AdminDoctorsContent() {
  const doctors = useQuery(api.admin.getAllDoctors);
  const medicalCenters = useQuery(api.admin.getAllMedicalCenters);
  const createDoctor = useMutation(api.doctors.create);
  const updateDoctor = useMutation(api.doctors.update);
  const deleteDoctor = useMutation(api.doctors.deleteDoctor);
  const createMedicalCenter = useMutation(api.medicalCenters.create);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState<Id<"doctors"> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados del formulario
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCenterIds, setSelectedCenterIds] = useState<Id<"medicalCenters">[]>([]);
  const [showNewCenterForm, setShowNewCenterForm] = useState(false);
  const [newCenter, setNewCenter] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
  });

  // Resetear formulario cuando se abre
  useEffect(() => {
    if (showCreateForm || editingDoctorId) {
      if (editingDoctorId && doctors) {
        const doctor = doctors.find(d => d._id === editingDoctorId);
        if (doctor) {
          setName(doctor.name);
          setSpecialty(doctor.specialty || "");
          setEmail(doctor.email || "");
          setPhone(doctor.phone || "");
          setSelectedCenterIds(doctor.medicalCenters || []);
        }
      } else {
        setName("");
        setSpecialty("");
        setEmail("");
        setPhone("");
        setSelectedCenterIds([]);
      }
      setShowNewCenterForm(false);
    }
  }, [showCreateForm, editingDoctorId, doctors]);

  const handleAddCenter = (centerId: Id<"medicalCenters">) => {
    if (selectedCenterIds.length >= 2) {
      alert("Un doctor solo puede estar asociado con máximo 2 centros médicos");
      return;
    }
    if (!selectedCenterIds.includes(centerId)) {
      setSelectedCenterIds([...selectedCenterIds, centerId]);
    }
  };

  const handleRemoveCenter = (centerId: Id<"medicalCenters">) => {
    setSelectedCenterIds(selectedCenterIds.filter((id) => id !== centerId));
  };

  const handleCreateCenter = async () => {
    if (!newCenter.name || !newCenter.address || !newCenter.city) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }
    try {
      const centerId = await createMedicalCenter({
        name: newCenter.name,
        address: newCenter.address,
        city: newCenter.city,
        phone: newCenter.phone || undefined,
      });
      setSelectedCenterIds([...selectedCenterIds, centerId]);
      setNewCenter({ name: "", address: "", city: "", phone: "" });
      setShowNewCenterForm(false);
    } catch (error) {
      console.error("Error creating center:", error);
      alert("Error al crear el centro médico");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert("Por favor ingresa el nombre del doctor");
      return;
    }
    if (selectedCenterIds.length > 2) {
      alert("Un doctor solo puede estar asociado con máximo 2 centros médicos");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingDoctorId) {
        // Actualizar doctor existente
        await updateDoctor({
          id: editingDoctorId,
          name,
          specialty: specialty || undefined,
          email: email || undefined,
          phone: phone || undefined,
          medicalCenterIds: selectedCenterIds,
        });
        alert("Doctor actualizado exitosamente");
        setEditingDoctorId(null);
      } else {
        // Crear nuevo doctor
        await createDoctor({
          name,
          specialty: specialty || undefined,
          email: email || undefined,
          phone: phone || undefined,
          medicalCenterIds: selectedCenterIds,
        });
        alert("Doctor creado exitosamente");
        setShowCreateForm(false);
      }
      
      // Resetear formulario
      setName("");
      setSpecialty("");
      setEmail("");
      setPhone("");
      setSelectedCenterIds([]);
    } catch (error: any) {
      console.error("Error saving doctor:", error);
      alert("Error al guardar el doctor: " + (error.message || "Error desconocido"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (doctorId: Id<"doctors">) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este doctor? Esta acción no se puede deshacer."
    );
    
    if (!confirmed) {
      return;
    }
    
    try {
      await deleteDoctor({ id: doctorId });
      alert("Doctor eliminado exitosamente");
      if (editingDoctorId === doctorId) {
        setEditingDoctorId(null);
      }
    } catch (error: any) {
      console.error("Error deleting doctor:", error);
      alert("Error al eliminar doctor: " + (error.message || "Error desconocido"));
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingDoctorId(null);
    setName("");
    setSpecialty("");
    setEmail("");
    setPhone("");
    setSelectedCenterIds([]);
    setShowNewCenterForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Stethoscope className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                Gestionar Doctores
              </h1>
            </div>
            <button
              onClick={() => {
                setShowCreateForm(true);
                setEditingDoctorId(null);
              }}
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 active:scale-95 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              Crear Doctor
            </button>
          </div>

          {/* Formulario de creación/edición */}
          {(showCreateForm || editingDoctorId) && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingDoctorId ? "Editar Doctor" : "Crear Nuevo Doctor"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none hover:border-gray-300"
                      placeholder="Nombre del doctor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Especialidad
                    </label>
                    <input
                      type="text"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none hover:border-gray-300"
                      placeholder="Especialidad médica"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none hover:border-gray-300"
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all outline-none hover:border-gray-300"
                      placeholder="Teléfono de contacto"
                    />
                  </div>
                </div>

                {/* Selección de centros médicos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Centros Médicos (Máximo 2)
                  </label>
                  <div className="space-y-3">
                    {selectedCenterIds.map((centerId) => {
                      const center = medicalCenters?.find((c) => c._id === centerId);
                      return (
                        <div
                          key={centerId}
                          className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                        >
                          <div>
                            <p className="font-medium text-gray-800 text-sm">
                              {center?.name || "Unknown"}
                            </p>
                            {center && (
                              <p className="text-xs text-gray-600 mt-1">
                                {center.address}, {center.city}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCenter(centerId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}

                    {selectedCenterIds.length < 2 && (
                      <div>
                        {!showNewCenterForm ? (
                          <div className="space-y-2">
                            {medicalCenters
                              ?.filter((c) => !selectedCenterIds.includes(c._id))
                              .map((center) => (
                                <button
                                  key={center._id}
                                  type="button"
                                  onClick={() => handleAddCenter(center._id)}
                                  className="w-full text-left p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <p className="font-medium text-gray-800 text-sm">
                                    {center.name}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {center.address}, {center.city}
                                  </p>
                                </button>
                              ))}
                            <button
                              type="button"
                              onClick={() => setShowNewCenterForm(true)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Agregar Nuevo Centro Médico
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-300 space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Nombre *
                              </label>
                              <input
                                type="text"
                                value={newCenter.name}
                                onChange={(e) =>
                                  setNewCenter({ ...newCenter, name: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Dirección *
                              </label>
                              <input
                                type="text"
                                value={newCenter.address}
                                onChange={(e) =>
                                  setNewCenter({ ...newCenter, address: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Ciudad *
                              </label>
                              <input
                                type="text"
                                value={newCenter.city}
                                onChange={(e) =>
                                  setNewCenter({ ...newCenter, city: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Teléfono
                              </label>
                              <input
                                type="tel"
                                value={newCenter.phone}
                                onChange={(e) =>
                                  setNewCenter({ ...newCenter, phone: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={handleCreateCenter}
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                              >
                                Guardar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowNewCenterForm(false);
                                  setNewCenter({ name: "", address: "", city: "", phone: "" });
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    {isSubmitting ? "Guardando..." : editingDoctorId ? "Actualizar Doctor" : "Crear Doctor"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de doctores */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Doctores Registrados</h2>
            {doctors === undefined ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Cargando doctores...</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-8">
                <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay doctores registrados</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-green-100 p-3 rounded-full">
                          <Stethoscope className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {doctor.name}
                          </h3>
                          {doctor.specialty && (
                            <div className="flex items-center gap-1 mt-1">
                              <Stethoscope className="w-4 h-4 text-gray-400" />
                              <p className="text-sm text-gray-600">{doctor.specialty}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingDoctorId(doctor._id);
                            setShowCreateForm(false);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doctor._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {doctor.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {doctor.email}
                        </div>
                      )}
                      {doctor.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          {doctor.phone}
                        </div>
                      )}
                    </div>

                    {doctor.medicalCenters && doctor.medicalCenters.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <p className="text-sm font-medium text-gray-700">
                            Centros Médicos:
                          </p>
                        </div>
                        <MedicalCenterDisplay centerIds={doctor.medicalCenters} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
    </div>
  );
}

export default function AdminDoctorsPage() {
  return <AdminDoctorsContent />;
}

