"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

export function ConvexSetupMessage() {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Verificar si Convex está configurado
    // Las variables NEXT_PUBLIC_* están disponibles en tiempo de compilación en Next.js
    if (typeof window !== "undefined") {
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
      
      // Verificar si la URL es válida (no vacía y no es un placeholder)
      const hasValidUrl = convexUrl && 
                          convexUrl.trim() !== "" && 
                          !convexUrl.includes("placeholder") &&
                          (convexUrl.startsWith("http://") || convexUrl.startsWith("https://"));
      
      // Solo mostrar el mensaje si NO hay una URL válida
      if (!hasValidUrl) {
        setShowMessage(true);
      } else {
        setShowMessage(false);
      }
    }
  }, []);

  if (!showMessage) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-50 border-b border-yellow-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-yellow-800">
              <strong>Configuración requerida:</strong> Necesitas configurar Convex para usar esta aplicación.
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Ejecuta <code className="bg-yellow-100 px-1 rounded">npx convex dev</code> en tu terminal para configurar Convex.
            </p>
          </div>
          <button
            onClick={() => setShowMessage(false)}
            className="text-yellow-600 hover:text-yellow-800"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

