"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { VisitorOnlyRoute } from "@/components/VisitorOnlyRoute";
import { Navigation } from "@/components/Navigation";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plus, Pill, X } from "lucide-react";

function MedicationsContent() {
  const { t } = useLanguage();
  const medications = useQuery(api.medications.list);
  const createMedication = useMutation(api.medications.create);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState<"units" | "boxes" | "samples">("units");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert("Por favor ingresa el nombre del medicamento");
      return;
    }

    setIsSubmitting(true);
    try {
      await createMedication({
        name,
        description: description || undefined,
        unit,
      });
      setName("");
      setDescription("");
      setUnit("units");
      setShowForm(false);
    } catch (error) {
      console.error("Error creating medication:", error);
      alert("Error al crear el medicamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <VisitorOnlyRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              {t("medications.title")}
            </h1>
            <div className="flex items-center gap-4">
              <LanguageToggle />
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  {t("medications.newMedication")}
                </button>
              )}
            </div>
          </div>

          {showForm && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {t("medications.createMedication")}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setName("");
                    setDescription("");
                    setUnit("units");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("medications.name")} *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("medications.description")}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("medications.unit")}
                  </label>
                  <select
                    value={unit}
                    onChange={(e) =>
                      setUnit(e.target.value as "units" | "boxes" | "samples")
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="units">{t("medications.units")}</option>
                    <option value="boxes">{t("medications.boxes")}</option>
                    <option value="samples">{t("medications.samples")}</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? t("common.loading") : t("medications.save")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setName("");
                      setDescription("");
                      setUnit("units");
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    {t("medications.cancel")}
                  </button>
                </div>
              </form>
            </div>
          )}

          {medications === undefined ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{t("common.loading")}</p>
            </div>
          ) : medications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <Pill className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">
                {t("medications.noMedications")}
              </p>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  {t("medications.createMedication")}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medications.map((medication) => (
                <div
                  key={medication._id}
                  className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Pill className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {medication.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {t(`medications.${medication.unit}`)}
                      </p>
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
      </VisitorOnlyRoute>
    </ProtectedRoute>
  );
}

export default function MedicationsPage() {
  return <MedicationsContent />;
}

