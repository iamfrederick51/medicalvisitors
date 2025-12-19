"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

/**
 * Verifica si la URL de Convex es válida
 * Esta función se ejecuta a nivel de módulo para evitar problemas con hooks
 */
function isValidConvexUrl(url: string | undefined): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }
  
  const trimmedUrl = url.trim();
  
  // Debe ser una cadena no vacía
  if (trimmedUrl === "") {
    return false;
  }
  
  // No debe contener placeholders
  if (trimmedUrl.includes("placeholder")) {
    return false;
  }
  
  // Debe empezar con http:// o https://
  if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
    return false;
  }
  
  return true;
}

// Verificar la URL de Convex a nivel de módulo (se ejecuta una vez al cargar el módulo)
// Las variables NEXT_PUBLIC_* están disponibles en tiempo de compilación en Next.js
// y son reemplazadas en el código del cliente
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const hasValidConvexUrl = isValidConvexUrl(convexUrl);

export function ConvexSetupMessage() {
  // Siempre llamar useState con el mismo valor inicial para mantener consistencia
  // El valor se calcula a nivel de módulo, no dentro del componente
  const [showMessage, setShowMessage] = useState(!hasValidConvexUrl);

  // IMPORTANTE: Siempre renderizar algo, incluso si es null
  // Esto asegura que los hooks se llamen siempre en el mismo orden
  if (!showMessage) {
    return null;
  }

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
              1. Ejecuta <code className="bg-yellow-100 px-1 rounded">npx convex dev</code> en tu terminal<br/>
              2. Reinicia el servidor de Next.js (<code className="bg-yellow-100 px-1 rounded">npm run dev</code>) para que lea las variables de entorno
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

