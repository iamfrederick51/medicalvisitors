"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { Pill, Loader2 } from "lucide-react";

function MedicationsContent() {
  const medications = useQuery(api.medications.list);

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
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-3xl shadow-lg">
                <Pill className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                  Mis Medicamentos
                </h1>
                <p className="text-gray-600 mt-1">
                  Medicamentos asignados para tus visitas médicas
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          {medications === undefined ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium text-lg">Cargando medicamentos...</p>
              </div>
            </div>
          ) : medications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 max-w-md w-full text-center">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Pill className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No tienes medicamentos asignados
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Contacta con tu administrador para que te asigne medicamentos para tus visitas médicas.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medications.map((medication, index) => (
                <div
                  key={medication._id}
                  className="group bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-100 hover:border-purple-200 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: "fadeInUp 0.5s ease-out forwards",
                  }}
                >
                  {/* Icon and Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <Pill className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                        {medication.name}
                      </h3>
                      <div className="inline-flex items-center gap-2 bg-purple-50 px-3 py-1.5 rounded-full">
                        <span className="text-sm font-semibold text-purple-700">
                          {getUnitLabel(medication.unit)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {medication.description && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {medication.description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}

export default function MedicationsPage() {
  return <MedicationsContent />;
}
