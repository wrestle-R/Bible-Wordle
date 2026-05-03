import { useCallback, useEffect, useMemo, useState } from "react"

const THEME_STORAGE_KEY = "bw_theme"

const getPreferredTheme = () => {
  if (typeof window === "undefined") return "dark"

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

const applyThemeToDom = (theme) => {
  if (typeof document === "undefined") return
  document.documentElement.classList.toggle("dark", theme === "dark")
}

export const useTheme = () => {
  const [theme, setTheme] = useState(getPreferredTheme)

  useEffect(() => {
    applyThemeToDom(theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.add("theme-switching")
      window.setTimeout(() => {
        document.documentElement.classList.remove("theme-switching")
      }, 960)
    }
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))
  }, [])

  return useMemo(
    () => ({
      theme,
      toggleTheme,
      isDark: theme === "dark",
    }),
    [theme, toggleTheme],
  )
}
