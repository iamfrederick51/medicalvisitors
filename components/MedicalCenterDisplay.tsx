"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin } from "lucide-react";

interface MedicalCenterDisplayProps {
  centerIds: Id<"medicalCenters">[];
}

export function MedicalCenterDisplay({ centerIds }: MedicalCenterDisplayProps) {
  const { t } = useLanguage();
  const centers = useQuery(api.medicalCenters.list);

  if (!centers || centerIds.length === 0) {
    return null;
  }

  const displayCenters = centers.filter((center) => centerIds.includes(center._id));

  if (displayCenters.length === 0) {
    return null;
  }

  return (
    <div className="mt-3">
      <p className="text-sm font-medium text-gray-700 mb-2">
        {t("doctors.medicalCenters")}:
      </p>
      <div className="space-y-2">
        {displayCenters.map((center) => (
          <div
            key={center._id}
            className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200"
          >
            <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-gray-800 text-sm">{center.name}</p>
              <p className="text-xs text-gray-600 mt-1">
                {center.address}, {center.city}
              </p>
              {center.phone && (
                <p className="text-xs text-gray-600">{center.phone}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

