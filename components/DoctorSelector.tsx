"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, User } from "lucide-react";
import { MedicalCenterDisplay } from "./MedicalCenterDisplay";

interface DoctorSelectorProps {
  value?: Id<"doctors">;
  onChange: (doctorId: Id<"doctors"> | undefined) => void;
  onDoctorSelect?: (doctor: any) => void;
}

export function DoctorSelector({ value, onChange, onDoctorSelect }: DoctorSelectorProps) {
  const { t } = useLanguage();
  const doctors = useQuery(api.doctors.list);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  useEffect(() => {
    if (value && doctors) {
      const doctor = doctors.find((d) => d._id === value);
      if (doctor) {
        setSelectedDoctor(doctor);
      }
    }
  }, [value, doctors]);

  const filteredDoctors = doctors?.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSelectDoctor = (doctor: any) => {
    setSelectedDoctor(doctor);
    onChange(doctor._id);
    setIsOpen(false);
    setSearchTerm("");
    
    if (onDoctorSelect) {
      onDoctorSelect(doctor);
    }
  };

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
        MÉDICO
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-left flex items-center justify-between hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <span className="flex items-center gap-2 text-gray-700">
            <User className="w-4 h-4 text-gray-400" />
            {selectedDoctor ? selectedDoctor.name : t("visits.selectDoctor")}
          </span>
          <Search className="w-4 h-4 text-gray-400" />
        </button>
        {isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
            <div className="p-2 sticky top-0 bg-white border-b border-gray-100">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("visits.selectDoctor")}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                autoFocus
              />
            </div>
            <div className="py-1">
              {filteredDoctors.length === 0 ? (
                <div className="px-4 py-2 text-gray-500 text-sm">
                  {t("doctors.noDoctors")}
                </div>
              ) : (
                filteredDoctors.map((doctor) => (
                  <button
                    key={doctor._id}
                    type="button"
                    onClick={() => handleSelectDoctor(doctor)}
                    className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors rounded-lg mx-1"
                  >
                    <div className="font-medium text-gray-900">{doctor.name}</div>
                    {doctor.specialty && (
                      <div className="text-sm text-gray-500">{doctor.specialty}</div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {selectedDoctor && selectedDoctor.medicalCenters && selectedDoctor.medicalCenters.length > 0 && (
        <MedicalCenterDisplay centerIds={selectedDoctor.medicalCenters} />
      )}
    </div>
  );
}

