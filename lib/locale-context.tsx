"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Locale } from "./i18n"
import { defaultLocale, translations } from "./i18n"

interface LocaleContextType {
  locale: Locale["code"]
  setLocale: (locale: Locale["code"]) => void
  t: (key: string) => string
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale["code"]>(defaultLocale)

  const t = (key: string): string => {
    return translations[locale]?.[key] || key
  }

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider")
  }
  return context
}
