import { useState, useCallback, useEffect } from "react"

type Theme = "dark" | "light"

const STORAGE_KEY = "querylab-theme"

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark"
    return (localStorage.getItem(STORAGE_KEY) as Theme) ?? "dark"
  })

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    document.documentElement.classList.toggle("light", theme === "light")
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"))
  }, [])

  return { theme, toggleTheme }
}
