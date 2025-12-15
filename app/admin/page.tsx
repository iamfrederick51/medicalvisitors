"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Users, 
  Pill, 
  Stethoscope, 
  FileSpreadsheet, 
  Activity,
  Shield,
  Calendar,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function AdminContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const stats = useQuery(api.admin.getStats);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
                Panel de Administración
              </h1>
            </div>
            <p className="text-gray-500 text-sm sm:text-base md:text-lg">
              Gestiona usuarios, medicamentos, doctores y exporta reportes
            </p>
          </div>

          {/* Estadísticas */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
                <div className="text-center">
                  <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Usuarios</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
                    {stats.totalUsers}
                  </p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
                <div className="text-center">
                  <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Visitas</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
                    {stats.totalVisits}
                  </p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
                <div className="text-center">
                  <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Doctores</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
                    {stats.totalDoctors}
                  </p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
                <div className="text-center">
                  <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Medicamentos</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
                    {stats.totalMedications}
                  </p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
                <div className="text-center">
                  <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Centros</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
                    {stats.totalMedicalCenters}
                  </p>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
                <div className="text-center">
                  <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Completadas</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-green-600">
                    {stats.visitsByStatus.completed}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cards de Acceso Rápido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {/* Gestión de Usuarios */}
            <Link
              href="/admin/users"
              className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Users className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Usuarios</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Gestionar visitadores</p>
                </div>
              </div>
            </Link>

            {/* Gestión de Medicamentos */}
            <Link
              href="/admin/medications"
              className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <Pill className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Medicamentos</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Catálogo completo</p>
                </div>
              </div>
            </Link>

            {/* Gestión de Doctores */}
            <Link
              href="/admin/doctors"
              className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Stethoscope className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Doctores</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Base de datos médica</p>
                </div>
              </div>
            </Link>

            {/* Exportar a Excel */}
            <Link
              href="/admin/export"
              className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                  <FileSpreadsheet className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Exportar</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Reportes Excel</p>
                </div>
              </div>
            </Link>

            {/* Historial de Actividades */}
            <Link
              href="/admin/activity"
              className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group sm:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Historial</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Log de actividades</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function AdminPage() {
  return <AdminContent />;
}

