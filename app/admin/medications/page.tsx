"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useToast, ToastContainer } from "@/components/Toast";
import { Pill, Plus, Edit2, Trash2, X, Loader2 } from "lucide-react";

function AdminMedicationsContent() {
  const medications = useQuery(api.admin.getAllMedications);
  const createMedication = useMutation(api.medications.create);
  const updateMedication = useMutation(api.medications.update);
  const deleteMedication = useMutation(api.medications.deleteMedication);
  const { toasts, success, error, dismissToast } = useToast();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMedicationId, setEditingMedicationId] = useState<Id<"medications"> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados del formulario
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState<"units" | "boxes" | "samples">("units");

  // Log cuando los medicamentos cambian
  useEffect(() => {
    if (medications !== undefined) {
      console.log("[AdminMedications] Medications loaded:", {
        count: medications.length,
        medications: medications.map(m => ({ id: m._id, name: m.name, unit: m.unit })),
      });
    }
  }, [medications]);

  // Resetear formulario cuando se abre
  useEffect(() => {
    if (showCreateForm || editingMedicationId) {
      if (editingMedicationId && medications) {
        const medication = medications.find(m => m._id === editingMedicationId);
        if (medication) {
          setName(medication.name);
          setDescription(medication.description || "");
          setUnit(medication.unit);
        }
      } else {
        setName("");
        setDescription("");
        setUnit("units");
      }
    }
  }, [showCreateForm, editingMedicationId, medications]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    if (!trimmedName) {
      error("Por favor ingresa el nombre del medicamento");
      return;
    }

    console.log("[AdminMedications] Starting medication save:", {
      isEditing: !!editingMedicationId,
      medicationId: editingMedicationId,
      name: trimmedName,
      description: description.trim() || undefined,
      unit,
    });

    setIsSubmitting(true);
    try {
      if (editingMedicationId) {
        // Actualizar medicamento existente
        console.log("[AdminMedications] Updating medication:", editingMedicationId);
        await updateMedication({
          id: editingMedicationId,
          name: trimmedName,
          description: description.trim() || undefined,
          unit,
        });
        console.log("[AdminMedications] ✅ Medication updated successfully");
        success("Medicamento actualizado exitosamente");
        setEditingMedicationId(null);
      } else {
        // Crear nuevo medicamento
        console.log("[AdminMedications] Creating new medication...");
        const medicationId = await createMedication({
          name: trimmedName,
          description: description.trim() || undefined,
          unit,
        });
        console.log("[AdminMedications] ✅ Medication created successfully. ID:", medicationId);
        
        // Esperar un momento para que la query se actualice
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verificar que el medicamento aparece en la lista
        if (medications) {
          const createdMedication = medications.find(m => m._id === medicationId);
          if (createdMedication) {
            console.log("[AdminMedications] ✅ Medication verified in list:", createdMedication);
          } else {
            console.warn("[AdminMedications] ⚠️ Medication not yet visible in list (may need refresh)");
          }
        }
        
        success("Medicamento creado exitosamente");
        setShowCreateForm(false);
      }
      
      // Resetear formulario
      setName("");
      setDescription("");
      setUnit("units");
    } catch (err: any) {
      console.error("[AdminMedications] ❌ Error saving medication:", {
        error: err,
        message: err?.message,
        stack: err?.stack,
        name: trimmedName,
        unit,
      });
      
      // Proporcionar mensaje de error más específico
      let errorMessage = "Error desconocido";
      if (err?.message) {
        errorMessage = err.message;
        // Si el mensaje incluye información útil, usarlo
        if (err.message.includes("Not authenticated")) {
          errorMessage = "No estás autenticado. Por favor inicia sesión nuevamente.";
        } else if (err.message.includes("requerido")) {
          errorMessage = err.message;
        } else if (err.message.includes("Error al")) {
          errorMessage = err.message;
        }
      }
      
      error(`Error al guardar el medicamento: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (medicationId: Id<"medications">) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este medicamento? Esta acción no se puede deshacer."
    );
    
    if (!confirmed) {
      return;
    }
    
    try {
      await deleteMedication({ id: medicationId });
      success("Medicamento eliminado exitosamente");
      if (editingMedicationId === medicationId) {
        setEditingMedicationId(null);
      }
    } catch (err: any) {
      console.error("Error deleting medication:", err);
      error("Error al eliminar medicamento: " + (err.message || "Error desconocido"));
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingMedicationId(null);
    setName("");
    setDescription("");
    setUnit("units");
  };

  const getUnitLabel = (unit: "units" | "boxes" | "samples") => {
    switch (unit) {
      case "units":
        return "Unidades";
      case "boxes":
        return "Cajas";
      case "samples":
        return "Muestras";
      default:
        return unit;
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Pill className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                Gestionar Medicamentos
              </h1>
            </div>
            <button
              onClick={() => {
                setShowCreateForm(true);
                setEditingMedicationId(null);
              }}
              className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 active:scale-95 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              Crear Medicamento
            </button>
          </div>

          {/* Formulario de creación/edición */}
          {(showCreateForm || editingMedicationId) && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingMedicationId ? "Editar Medicamento" : "Crear Nuevo Medicamento"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none hover:border-gray-300"
                    placeholder="Nombre del medicamento"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none hover:border-gray-300"
                    placeholder="Descripción del medicamento"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unidad *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) =>
                      setUnit(e.target.value as "units" | "boxes" | "samples")
                    }
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none hover:border-gray-300"
                  >
                    <option value="units">Unidades</option>
                    <option value="boxes">Cajas</option>
                    <option value="samples">Muestras</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    {isSubmitting ? "Guardando..." : editingMedicationId ? "Actualizar Medicamento" : "Crear Medicamento"}
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

          {/* Lista de medicamentos */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Medicamentos Registrados</h2>
            {medications === undefined ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Cargando medicamentos...</p>
              </div>
            ) : medications.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Pill className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay medicamentos registrados</h3>
                <p className="text-gray-500 mb-6">Comienza creando tu primer medicamento</p>
                <button
                  onClick={() => {
                    setShowCreateForm(true);
                    setEditingMedicationId(null);
                  }}
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-2xl hover:bg-purple-700 active:scale-95 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  Crear Primer Medicamento
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {medications.map((medication) => (
                  <div
                    key={medication._id}
                    className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-purple-100 p-3 rounded-full">
                          <Pill className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {medication.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {getUnitLabel(medication.unit)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingMedicationId(medication._id);
                            setShowCreateForm(false);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(medication._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {medication.description && (
                      <p className="text-sm text-gray-600">{medication.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </>
  );
}

export default function AdminMedicationsPage() {
  return <AdminMedicationsContent />;
}

