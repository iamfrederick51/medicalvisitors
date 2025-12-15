"use client";

import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar, User, Pill, FileText } from "lucide-react";

interface VisitCardProps {
  visit: {
    _id: string;
    doctor?: { name: string; specialty?: string } | null;
    date: number;
    medications: Array<{
      medication?: { name: string; unit: string } | null;
      quantity: number;
      notes?: string;
    }>;
    status: "completed" | "pending" | "cancelled";
    notes?: string;
  };
}

export function VisitCard({ visit }: VisitCardProps) {
  const { t } = useLanguage();

  const statusColors = {
    completed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              {visit.doctor?.name || "Unknown Doctor"}
            </h3>
          </div>
          {visit.doctor?.specialty && (
            <p className="text-sm text-gray-600 mb-2">{visit.doctor.specialty}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            {format(new Date(visit.date), "PPP")}
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusColors[visit.status]
          }`}
        >
          {t(`visits.${visit.status}`)}
        </span>
      </div>

      {visit.medications.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Pill className="w-4 h-4 text-purple-600" />
            <p className="text-sm font-medium text-gray-700">
              {t("visits.medications")}:
            </p>
          </div>
          <div className="space-y-1 ml-6">
            {visit.medications.map((med, index) => (
              <p key={index} className="text-sm text-gray-600">
                • {med.medication?.name || "Unknown"} - {med.quantity}{" "}
                {med.medication?.unit || "units"}
                {med.notes && ` (${med.notes})`}
              </p>
            ))}
          </div>
        </div>
      )}

      {visit.notes && (
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
          <p className="text-sm text-gray-600">{visit.notes}</p>
        </div>
      )}
    </div>
  );
}

