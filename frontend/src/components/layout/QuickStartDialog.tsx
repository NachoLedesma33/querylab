import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowRight, Sparkles, Database, GitBranch, Filter, Loader2, X } from "lucide-react"

interface Exercise {
  id: string
  icon: typeof Database
  title: string
  description: string
  query: string
}

const exercises: Exercise[] = [
  {
    id: "explore",
    icon: Database,
    title: "Explorar una tabla",
    description: "Ejecutá un SELECT * FROM movies para ver todas las películas.",
    query: "SELECT * FROM movies"
  },
  {
    id: "join",
    icon: GitBranch,
    title: "Hacer una JOIN",
    description: "Ejecutá una consulta JOIN entre usuarios, películas y watch_history.",
    query: "SELECT u.name, m.title FROM users u JOIN watch_history w ON u.id = w.user_id JOIN movies m ON w.movie_id = m.id LIMIT 10"
  },
  {
    id: "filter",
    icon: Filter,
    title: "Buscar por condición",
    description: "Filtrá películas con rating superior a 8.0.",
    query: "SELECT title, rating FROM movies WHERE rating > 8.0 ORDER BY rating DESC"
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleClose = useCallback(() => {
    if (executing) return
    try { localStorage.setItem("querylab-onboarding", "completed") } catch {}
    onClose()
  }, [executing, onClose])

  const handleExecute = useCallback(async (exercise: Exercise) => {
    if (executing) return
    setExecuting(exercise.id)
    setErrorMsg(null)

    try {
      await onExecute(exercise.query)
      const next = new Set(completedIds)
      next.add(exercise.id)
      setCompletedIds(next)
      setExecuting(null)

      if (next.size >= exercises.length) {
        try { localStorage.setItem("querylab-onboarding", "completed") } catch {}
        setTimeout(() => onClose(), 300)
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error al ejecutar la consulta")
      setExecuting(null)
    }
  }, [executing, completedIds, onExecute, onClose])

  if (!open) return null

  const allCompleted = completedIds.size >= exercises.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={handleClose}>
      <Card
        className="relative w-full max-w-lg border border-border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          disabled={executing !== null}
          className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          aria-label="Cerrar Quick Start"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3 p-6 pb-3 border-b border-border">
          <div className="size-10 flex items-center justify-center rounded bg-accent/10">
            <Sparkles className="size-5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Bienvenido a QueryLab</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Completá los 3 ejercicios para familiarizarte
            </p>
          </div>
        </div>

        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {exercises.map((ex, i) => {
            const isCompleted = completedIds.has(ex.id)
            const isExecuting = executing === ex.id

            return (
              <div
                key={ex.id}
                className={`p-4 rounded border transition-colors ${
                  isCompleted
                    ? "border-accent/30 bg-accent/[0.02]"
                    : isExecuting
                    ? "border-accent/50 bg-accent/[0.03]"
                    : "border-border hover:border-accent/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`size-9 flex items-center justify-center rounded shrink-0 ${
                    isCompleted ? "bg-accent/20 text-accent" :
                    isExecuting ? "bg-accent/20 text-accent" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {isExecuting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ex.icon className="size-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="sharp" className="text-[10px]">
                        {i + 1} de {exercises.length}
                      </Badge>
                      {isCompleted && (
                        <Badge variant="sharp" className="text-[10px] bg-accent/20 text-accent border-accent">
                          <Check className="size-2.5 mr-0.5" />
                          Completado
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-0.5">{ex.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{ex.description}</p>

                    <Button
                      variant={isCompleted ? "ghost" : "sharp-accent"}
                      size="sm"
                      onClick={() => handleExecute(ex)}
                      disabled={isCompleted || executing !== null}
                      className="w-full justify-center gap-2 h-8"
                    >
                      {isExecuting ? (
                        <><Loader2 className="size-3 animate-spin" /> Ejecutando...</>
                      ) : isCompleted ? (
                        <><Check className="size-3" /> Completado</>
                      ) : (
                        <><ArrowRight className="size-3" /> Ejecutar consulta</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {errorMsg && !executing && (
          <div className="px-6 pb-4">
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive">
              <span className="font-semibold">Error: </span>
              {errorMsg.length > 200 ? errorMsg.slice(0, 200) + "..." : errorMsg}
            </div>
          </div>
        )}

        <div className="px-6 pb-5 pt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {completedIds.size} de {exercises.length} ejercicios completados
          </span>
          {allCompleted ? (
            <Button variant="sharp-accent" size="sm" onClick={handleClose}>
              <Check className="size-3 mr-1" /> Comenzar
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleClose} disabled={executing !== null}>
              Saltar tutorial
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}