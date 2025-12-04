"use client"

import { useTheme as useThemeHook } from "next-themes"

export function useTheme() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useThemeHook()

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return { theme, setTheme, systemTheme, resolvedTheme, toggleTheme }
}
