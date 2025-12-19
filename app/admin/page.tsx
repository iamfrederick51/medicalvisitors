"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Users, 
  Pill, 
  Stethoscope, 
  FileSpreadsheet, 
  Activity,
  Shield,
  Calendar,
  TrendingUp,
  Building2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function AdminContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const stats = useQuery(api.admin.getStats);
  const [statsError, setStatsError] = useState(false);

  // Debug: Verificar rol
  useEffect(() => {
    if (isLoaded && user) {
      const role = user?.publicMetadata?.role as string | undefined;
      console.log("[AdminPage] User role:", {
        role,
        publicMetadata: user.publicMetadata,
        email: user.primaryEmailAddress?.emailAddress,
      });
    }
  }, [isLoaded, user]);

  // Valores por defecto si stats no está disponible
  const defaultStats = {
    totalUsers: 0,
    totalVisits: 0,
    totalDoctors: 0,
    totalMedications: 0,
    totalMedicalCenters: 0,
    visitsByStatus: {
      completed: 0,
      pending: 0,
      cancelled: 0,
    },
  };

  // Timeout para evitar espera infinita si Convex falla
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (stats === undefined) {
        console.warn("[Admin] Stats query taking too long, using default values");
        setStatsError(true);
      }
    }, 5000); // 5 segundos máximo

    return () => clearTimeout(timeout);
  }, [stats]);

  // Usar stats si está disponible, sino usar valores por defecto
  const displayStats = stats || defaultStats;

  return (
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
          {displayStats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
              <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Usuarios</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
                    {displayStats.totalUsers}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Visitas</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
                    {displayStats.totalVisits}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Doctores</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
                    {displayStats.totalDoctors}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Medicamentos</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
                    {displayStats.totalMedications}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Centros</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900">
                    {displayStats.totalMedicalCenters}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="text-center">
                  <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Completadas</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-green-600">
                    {displayStats.visitsByStatus.completed}
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
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group hover:scale-105 active:scale-95"
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
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group hover:scale-105 active:scale-95"
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
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group hover:scale-105 active:scale-95"
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
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group hover:scale-105 active:scale-95"
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

            {/* Gestión de Centros Médicos */}
            <Link
              href="/admin/medical-centers"
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group hover:scale-105 active:scale-95"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-cyan-50 rounded-xl flex items-center justify-center group-hover:bg-cyan-100 transition-colors">
                  <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Centros Médicos</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Gestionar rutas y ubicaciones</p>
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
  );
}

export default function AdminPage() {
  return <AdminContent />;
}

