"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Building2, Plus, Edit2, Trash2, X, Phone, MapPin, Stethoscope, Users } from "lucide-react";

function AdminMedicalCentersContent() {
  const medicalCenters = useQuery(api.admin.getAllMedicalCenters);
  const doctors = useQuery(api.admin.getAllDoctors);
  const visitors = useQuery(api.users.list);
  const createMedicalCenter = useMutation(api.medicalCenters.create);
  const updateMedicalCenter = useMutation(api.medicalCenters.update);
  const deleteMedicalCenter = useMutation(api.medicalCenters.deleteMedicalCenter);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCenterId, setEditingCenterId] = useState<Id<"medicalCenters"> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados del formulario
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  // Resetear formulario cuando se abre
  useEffect(() => {
    if (showCreateForm || editingCenterId) {
      if (editingCenterId && medicalCenters) {
        const center = medicalCenters.find(c => c._id === editingCenterId);
        if (center) {
          setName(center.name);
          setAddress(center.address);
          setCity(center.city);
          setPhone(center.phone || "");
        }
      } else {
        setName("");
        setAddress("");
        setCity("");
        setPhone("");
      }
    }
  }, [showCreateForm, editingCenterId, medicalCenters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !city) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingCenterId) {
        await updateMedicalCenter({
          id: editingCenterId,
          name,
          address,
          city,
          phone: phone || undefined,
        });
        alert("Centro médico actualizado exitosamente");
      } else {
        await createMedicalCenter({
          name,
          address,
          city,
          phone: phone || undefined,
        });
        alert("Centro médico creado exitosamente");
      }
      setShowCreateForm(false);
      setEditingCenterId(null);
      setName("");
      setAddress("");
      setCity("");
      setPhone("");
    } catch (error: any) {
      console.error("Error saving medical center:", error);
      alert("Error al guardar el centro médico: " + (error.message || "Error desconocido"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: Id<"medicalCenters">) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este centro médico?")) {
      return;
    }
    try {
      await deleteMedicalCenter({ id });
      alert("Centro médico eliminado exitosamente");
    } catch (error: any) {
      console.error("Error deleting medical center:", error);
      alert("Error al eliminar el centro médico: " + (error.message || "Error desconocido"));
    }
  };

  const handleEdit = (id: Id<"medicalCenters">) => {
    setEditingCenterId(id);
    setShowCreateForm(true);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingCenterId(null);
    setName("");
    setAddress("");
    setCity("");
    setPhone("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-semibold text-gray-900">
                  Gestionar Centros Médicos
                </h1>
              </div>
              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  Crear Centro Médico
                </button>
              )}
            </div>
            <p className="text-gray-500">
              Administra los centros médicos, asigna doctores y visualiza visitadores asignados
            </p>
          </div>

          {/* Formulario de creación/edición */}
          {showCreateForm && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingCenterId ? "Editar Centro Médico" : "Crear Nuevo Centro Médico"}
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none hover:border-gray-300"
                      placeholder="Nombre del centro médico"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none hover:border-gray-300"
                      placeholder="Ciudad"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    placeholder="Dirección completa"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    placeholder="Teléfono (opcional)"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    {isSubmitting ? "Guardando..." : editingCenterId ? "Actualizar" : "Crear"}
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

          {/* Lista de centros médicos */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Centros Médicos Registrados</h2>
            {medicalCenters === undefined ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Cargando centros médicos...</p>
              </div>
            ) : medicalCenters.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay centros médicos registrados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {medicalCenters.map((center) => {
                  // Encontrar doctores asociados a este centro
                  const associatedDoctors = doctors?.filter(doc => 
                    doc.medicalCenters.includes(center._id)
                  ) || [];
                  
                  // Encontrar visitadores asignados a este centro
                  const associatedVisitors = visitors?.filter(visitor =>
                    visitor.assignedMedicalCenters?.some(mc => mc._id === center._id)
                  ) || [];

                  return (
                    <div
                      key={center._id}
                      className="border-2 border-gray-200 rounded-3xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 bg-white"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">
                              {center.name}
                            </h3>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{center.address}, {center.city}</span>
                            </div>
                            {center.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span>{center.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(center._id)}
                            className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(center._id)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Información de doctores y visitadores */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Stethoscope className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">
                              Doctores Asociados ({associatedDoctors.length})
                            </span>
                          </div>
                          <div className="space-y-1">
                            {associatedDoctors.length > 0 ? (
                              associatedDoctors.map((doctor) => (
                                <div key={doctor._id} className="text-sm text-gray-600 pl-6">
                                  • {doctor.name} {doctor.specialty && `- ${doctor.specialty}`}
                                </div>
                              ))
                            ) : (
                              <span className="text-sm text-gray-400 pl-6">Ningún doctor asignado</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-gray-700">
                              Visitadores Asignados ({associatedVisitors.length})
                            </span>
                          </div>
                          <div className="space-y-1">
                            {associatedVisitors.length > 0 ? (
                              associatedVisitors.map((visitor) => (
                                <div key={visitor._id} className="text-sm text-gray-600 pl-6">
                                  • {visitor.name || visitor.user?.username || "Sin nombre"}
                                </div>
                              ))
                            ) : (
                              <span className="text-sm text-gray-400 pl-6">Ningún visitador asignado</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}

export default function AdminMedicalCentersPage() {
  return <AdminMedicalCentersContent />;
}

