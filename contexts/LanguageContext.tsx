"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "es" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Inicializar el estado con el valor del localStorage si está disponible
  // Esto evita tener que actualizar el estado después del primer render
  const getInitialLanguage = (): Language => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("language") as Language;
      if (savedLanguage && (savedLanguage === "es" || savedLanguage === "en")) {
        return savedLanguage;
      }
    }
    return "es";
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [translations, setTranslations] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const translations = await import(`../locales/${language}.json`);
        setTranslations(translations.default);
      } catch (error) {
        console.error("Error loading translations:", error);
        // Mantener traducciones vacías si hay error
        setTranslations({});
      }
    };
    loadTranslations();
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
    }
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    return typeof value === "string" ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

