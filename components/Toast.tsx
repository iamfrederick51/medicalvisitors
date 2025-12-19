"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastComponent({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animación de entrada
    setTimeout(() => setIsVisible(true), 10);
    
    // Auto-dismiss después de 4 segundos
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(toast.id), 300); // Esperar a que termine la animación
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "info":
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div
      className={`
        ${getBgColor()}
        border-2 rounded-3xl shadow-2xl p-4 mb-3 min-w-[300px] max-w-[400px]
        flex items-start gap-3
        transition-all duration-300 ease-in-out
        ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"}
      `}
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{toast.message}</p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onDismiss(toast.id), 300);
        }}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// Hook para usar toasts
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    dismissToast,
    success: (message: string) => showToast(message, "success"),
    error: (message: string) => showToast(message, "error"),
    info: (message: string) => showToast(message, "info"),
  };
}
