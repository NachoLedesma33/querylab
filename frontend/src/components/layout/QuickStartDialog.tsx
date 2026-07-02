import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowRight, Sparkles, Database, GitBranch, Filter, Loader2, ChevronDown, ChevronRight } from "lucide-react"

interface Exercise {
  id: string
  icon: typeof Database
  title: string
  description: string
  query: string
  step: number
  total: number
}

const exercises: Exercise[] = [
  {
    id: "explore",
    icon: Database,
    title: "Explorar una tabla",
    description: "Ejecutá 'SELECT * FROM movies' para ver todas las películas.",
    query: "SELECT * FROM movies",
    step: 1,
    total: 3
  },
  {
    id: "join",
    icon: GitBranch,
    title: "Hacer una JOIN",
    description: "Ejecutá una consulta JOIN para ver relaciones.",
    query: "SELECT u.name, m.title FROM users u JOIN watch_history w ON u.id = w.user_id JOIN movies m ON w.movie_id = m.id LIMIT 10",
    step: 2,
    total: 3
  },
  {
    id: "filter",
    icon: Filter,
    title: "Buscar por condición",
    description: "Filtrá películas con rating superior a 8.0",
    query: "SELECT title, rating FROM movies WHERE rating > 8.0 ORDER BY rating DESC",
    step: 3,
    total: 3
  }
]

interface QuickStartDialogProps {
  open: boolean
  onClose: () => void
  onExecute: (query: string) => Promise<void>
}

export function QuickStartDialog({ open, onClose, onExecute }: QuickStartDialogProps) {
  const [executing, setExecuting] = useState<string | null>(null)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState(false)

  const hadOnboarding = useRef(false)

  const handleClose = useCallback(() => {
    if (executing) return
    if (!hadOnboarding.current) {
      try { localStorage.setItem("querylab-onboarding", "completed") } catch {}
      hadOnboarding.current = true
    }
    onClose()
  }, [executing, onClose])

  const handleExecute = useCallback(async (exercise: Exercise) => {
    if (executing) return

    setExecuting(exercise.id)
    setCollapsed(true)

    try {
      await onExecute(exercise.query)
      const next = new Set(completedIds)
      next.add(exercise.id)
      setCompletedIds(next)
    } catch {
      setExecuting(null)
      return
    }
    setExecuting(null)

    if (completedIds.size + 1 >= exercises.length) {
      try { localStorage.setItem("querylab-onboarding", "completed") } catch {}
      hadOnboarding.current = true
      setTimeout(() => onClose(), 600)
    }
  }, [executing, completedIds, onExecute, onClose])

  if (!open) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 max-w-xs">
      <Card className="w-full border border-border bg-background shadow-lg">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Quick Start
            </span>
            <Badge variant="sharp" className="text-[9px]">
              {completedIds.size}/{exercises.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={collapsed ? "Expandir" : "Colapsar"}
            >
              {collapsed ? <ChevronRight className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>
            <button
              onClick={handleClose}
              disabled={executing !== null}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Cerrar Quick Start"
            >
              ✕
            </button>
          </div>
        </div>

        <div className={`transition-all duration-200 ${collapsed ? "max-h-0 overflow-hidden" : "max-h-96 overflow-y-auto"}`}>
          <div className="p-2">
            <p className="text-[10px] text-muted-foreground px-1 mb-2 leading-relaxed">
              Completá los 3 ejercicios para familiarizarte con QueryLab.
            </p>

            {exercises.map((ex) => {
              const isCompleted = completedIds.has(ex.id)
              const isExecuting = executing === ex.id

              return (
                <div
                  key={ex.id}
                  className={`p-2 rounded border mb-1.5 transition-colors ${
                    isCompleted
                      ? "border-accent/30 opacity-60"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`size-6 flex items-center justify-center rounded shrink-0 ${
                      isCompleted ? "bg-accent/20 text-accent" :
                      isExecuting ? "bg-accent/20 text-accent animate-pulse" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {isExecuting ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <ex.icon className="size-3" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-medium text-foreground">
                          {ex.title}
                        </span>
                        {isCompleted && (
                          <Check className="size-2.5 text-accent" />
                        )}
                      </div>
                      <p className="text-[9px] text-muted-foreground mb-1.5 leading-relaxed">
                        {ex.description}
                      </p>
                      <Button
                        variant={isCompleted ? "ghost" : isExecuting ? "sharp" : "sharp-accent"}
                        size="xs"
                        onClick={() => handleExecute(ex)}
                        disabled={isCompleted || executing !== null}
                        className="w-full text-[10px] h-6 gap-1 justify-center"
                      >
                        {isExecuting ? (
                          <><Loader2 className="size-2.5 animate-spin" /> Ejecutando...</>
                        ) : isCompleted ? (
                          <><Check className="size-2.5" /> Completado</>
                        ) : (
                          <><ArrowRight className="size-2.5" /> Ejecutar</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {completedIds.size === exercises.length && (
          <div className="p-2 border-t border-border bg-accent/10 text-center">
            <span className="text-[10px] font-medium text-accent">
              ¡Todos los ejercicios completados! 🎉
            </span>
            <Button variant="ghost" size="xs" onClick={handleClose} className="ml-2 text-[10px]">
              Cerrar
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}