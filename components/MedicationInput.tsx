"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plus, X, Pill } from "lucide-react";

interface MedicationItem {
  medicationId: Id<"medications">;
  quantity: number;
  notes?: string;
}

interface MedicationInputProps {
  value: MedicationItem[];
  onChange: (medications: MedicationItem[]) => void;
}

export function MedicationInput({ value, onChange }: MedicationInputProps) {
  const { t } = useLanguage();
  const medications = useQuery(api.medications.list);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMedicationId, setSelectedMedicationId] = useState<Id<"medications"> | "">("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const handleAdd = () => {
    if (!selectedMedicationId) return;
    onChange([
      ...value,
      {
        medicationId: selectedMedicationId as Id<"medications">,
        quantity,
        notes: notes || undefined,
      },
    ]);
    setSelectedMedicationId("");
    setQuantity(1);
    setNotes("");
    setShowAddForm(false);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t("visits.medications")}
      </label>
      <div className="space-y-2">
        {value.map((item, index) => {
          const medication = medications?.find((m) => m._id === item.medicationId);
          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <Pill className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {medication?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-600">
                    {item.quantity} {medication?.unit || "units"}
                    {item.notes && ` - ${item.notes}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
        {showAddForm ? (
          <div className="p-4 bg-white border border-gray-300 rounded-lg space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t("medications.name")}
              </label>
              <select
                value={selectedMedicationId}
                onChange={(e) => setSelectedMedicationId(e.target.value as Id<"medications">)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t("visits.selectDoctor")}</option>
                {medications?.map((med) => (
                  <option key={med._id} value={med._id}>
                    {med.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t("visits.quantity")}
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t("visits.notes")} ({t("common.cancel")})
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("visits.notes")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                {t("common.save")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedMedicationId("");
                  setQuantity(1);
                  setNotes("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("visits.addMedication")}
          </button>
        )}
      </div>
    </div>
  );
}

