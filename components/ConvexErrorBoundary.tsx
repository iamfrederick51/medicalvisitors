"use client";

import { ReactNode, Component, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ConvexErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Convex error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Error de Configuración
            </h1>
            <p className="text-gray-600 mb-4">
              Parece que Convex no está configurado correctamente.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Por favor ejecuta <code className="bg-gray-100 px-2 py-1 rounded">npx convex dev</code> en tu terminal para configurar Convex.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

