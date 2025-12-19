"use client";

import { useState } from "react";
import { User } from "lucide-react";

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  role?: "admin" | "visitor" | null;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function UserAvatar({ 
  name, 
  email, 
  role = "visitor",
  size = "md",
  showTooltip = true 
}: UserAvatarProps) {
  const [showTooltipState, setShowTooltipState] = useState(false);

  // Obtener iniciales del nombre o email
  const getInitials = () => {
    if (name) {
      const words = name.trim().split(/\s+/);
      if (words.length >= 2) {
        return (words[0][0] + words[words.length - 1][0]).toUpperCase().slice(0, 2);
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  // Obtener color según el rol
  const getColorClasses = () => {
    if (role === "admin") {
      return "bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700";
    }
    return "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700";
  };

  // Obtener tamaño
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-8 h-8 text-xs";
      case "lg":
        return "w-14 h-14 text-lg";
      default:
        return "w-11 h-11 text-sm";
    }
  };

  // Obtener texto para mostrar
  const displayName = name || email || "Usuario";
  const displayRole = role === "admin" ? "Administrador" : "Visitador Médico";

  return (
    <div className="relative">
      <div
        className={`
          ${getSizeClasses()}
          ${getColorClasses()}
          rounded-full
          flex items-center justify-center
          text-white font-bold
          shadow-lg
          border-2 border-white/20
          hover:shadow-xl
          hover:scale-110
          active:scale-95
          transition-all duration-300
          cursor-pointer
          select-none
        `}
        onMouseEnter={() => showTooltip && setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
      >
        {getInitials()}
      </div>
      
      {/* Tooltip */}
      {showTooltip && showTooltipState && (
        <div className="absolute right-0 top-full mt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="bg-gray-900 text-white text-xs rounded-xl py-2 px-3 shadow-2xl whitespace-nowrap">
            <div className="font-semibold">{displayName}</div>
            <div className="text-gray-300 mt-0.5">{displayRole}</div>
            {email && email !== name && (
              <div className="text-gray-400 text-[10px] mt-1">{email}</div>
            )}
            {/* Flecha del tooltip */}
            <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
}

