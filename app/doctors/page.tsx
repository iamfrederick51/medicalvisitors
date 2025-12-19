"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { Plus, User, Mail, Phone, Stethoscope, MapPin } from "lucide-react";
import { MedicalCenterDisplay } from "@/components/MedicalCenterDisplay";

function DoctorsContent() {
  const { t } = useLanguage();
  const doctors = useQuery(api.doctors.list);
  const userProfile = useQuery(api.userProfiles.getCurrentProfile);
  const isAdmin = userProfile?.role === "admin";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">{t("doctors.title")}</h1>
            <div className="flex items-center gap-4">
              <LanguageToggle />
              {isAdmin && (
                <Link
                  href="/doctors/new"
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  {t("doctors.newDoctor")}
                </Link>
              )}
            </div>
          </div>

          {doctors === undefined ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{t("common.loading")}</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">{t("doctors.noDoctors")}</p>
              {isAdmin && (
                <Link
                  href="/doctors/new"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  {t("doctors.createDoctor")}
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <User className="w-6 h-6 text-blue-600" />
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
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-medium text-gray-700">
                          {t("doctors.medicalCenters")}:
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
    </ProtectedRoute>
  );
}

export default function DoctorsPage() {
  return <DoctorsContent />;
}

