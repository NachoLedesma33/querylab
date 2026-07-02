import { useEffect, useState } from "react"

export function SkipLink() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Tab" && e.target === document.body) {
        setVisible(true)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  return (
    <a
      href="#main-content"
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      className={`fixed top-2 left-2 z-[100] px-3 py-1.5 text-xs font-medium bg-accent text-accent-foreground border border-accent transition-all duration-150 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
    >
      Saltar al contenido principal
    </a>
  )
}