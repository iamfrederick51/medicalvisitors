"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { FileSpreadsheet, Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { format } from "date-fns";

function ExportContent() {
  const allVisits = useQuery(api.admin.getAllVisits);
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = () => {
    if (!allVisits || allVisits.length === 0) {
      alert("No hay visitas para exportar");
      return;
    }

    setIsExporting(true);

    try {
      // Preparar datos para Excel
      const excelData = allVisits.map((visit) => {
        const medications = visit.medications
          .map((m: any) => `${m.medication?.name || "N/A"} (${m.quantity} ${m.medication?.unit || ""})`)
          .join("; ");

        const visitDate = new Date(visit.date);
        
        return {
          "Fecha": format(visitDate, "dd/MM/yyyy"),
          "Hora": format(visitDate, "HH:mm"),
          "Visitador": visit.visitor?.email || "N/A",
          "Nombre Visitador": visit.visitor?.profile?.name || "N/A",
          "Doctor": visit.doctor?.name || "N/A",
          "Especialidad": visit.doctor?.specialty || "N/A",
          "Email Doctor": visit.doctor?.email || "N/A",
          "Teléfono Doctor": visit.doctor?.phone || "N/A",
          "Medicamentos": medications,
          "Estado": visit.status === "completed" ? "Completada" : visit.status === "pending" ? "Pendiente" : "Cancelada",
          "Notas": visit.notes || "",
          "Fecha de Creación": format(new Date(visit.createdAt), "dd/MM/yyyy HH:mm"),
        };
      });

      // Crear workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 12 }, // Fecha
        { wch: 8 },  // Hora
        { wch: 25 }, // Visitador
        { wch: 20 }, // Nombre Visitador
        { wch: 25 }, // Doctor
        { wch: 20 }, // Especialidad
        { wch: 25 }, // Email Doctor
        { wch: 15 }, // Teléfono Doctor
        { wch: 50 }, // Medicamentos
        { wch: 12 }, // Estado
        { wch: 30 }, // Notas
        { wch: 20 }, // Fecha de Creación
      ];
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Visitas");

      // Generar nombre de archivo con fecha
      const fileName = `visitas_medicas_${format(new Date(), "yyyy-MM-dd_HH-mm")}.xlsx`;

      // Descargar
      XLSX.writeFile(wb, fileName);

      alert(`Archivo ${fileName} descargado exitosamente`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Error al exportar a Excel");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="mb-4 sm:mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <FileSpreadsheet className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
                Exportar a Excel
              </h1>
            </div>
            <p className="text-gray-500 text-sm sm:text-base md:text-lg">
              Exporta todas las visitas médicas a un archivo Excel
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 md:p-6">
            <div className="text-center py-8 sm:py-12">
              <FileSpreadsheet className="w-16 h-16 sm:w-20 sm:h-20 text-orange-600 mx-auto mb-4 sm:mb-6" />
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                Exportar Historial Completo
              </h2>
              <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto">
                Descarga un archivo Excel con todas las visitas registradas por todos los visitadores médicos.
                Incluye información detallada de doctores, medicamentos entregados y fechas.
              </p>
              
              {allVisits === undefined ? (
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Cargando visitas...</span>
                </div>
              ) : (
                <>
                  <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">
                    Total de visitas: <span className="font-semibold text-gray-900">{allVisits.length}</span>
                  </p>
                  <button
                    onClick={exportToExcel}
                    disabled={isExporting || allVisits.length === 0}
                    className="bg-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-orange-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto text-sm sm:text-base"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Exportando...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>Descargar Excel</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function ExportPage() {
  return <ExportContent />;
}

