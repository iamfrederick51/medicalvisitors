"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { LanguageToggle } from "@/components/LanguageToggle";
import { VisitCard } from "@/components/VisitCard";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { Plus } from "lucide-react";

function VisitsContent() {
  const { t } = useLanguage();
  const visits = useQuery(api.visits.list);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">{t("visits.title")}</h1>
            <div className="flex items-center gap-4">
              <LanguageToggle />
              <Link
                href="/visits/new"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                {t("visits.newVisit")}
              </Link>
            </div>
          </div>

          {visits === undefined ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{t("common.loading")}</p>
            </div>
          ) : visits.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">{t("visits.noVisits")}</p>
              <Link
                href="/visits/new"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                {t("visits.createVisit")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visits.map((visit) => (
                <VisitCard key={visit._id} visit={visit} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function VisitsPage() {
  return <VisitsContent />;
}

