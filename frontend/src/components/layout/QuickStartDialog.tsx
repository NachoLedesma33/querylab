import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Check, ArrowRight, Sparkles, Database, GitBranch, Filter, Loader2, Zap } from "lucide-react"

interface QuickStartDialogProps {
  open: boolean
  onClose: () => void
  onExecute: (query: string) => Promise<void>
  onQueryComplete?: () => void
}

interface Exercise {
  id: string
  icon: typeof Database | typeof GitBranch | typeof Filter
  title: string
  description: string
  query: string
  hint: string
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
    hint: "Ejecutá la query haciendo click en 'Ejecutar consulta'",
    step: 1,
    total: 3
  },
  {
    id: "join",
    icon: GitBranch,
    title: "Hacer una JOIN",
    description: "Ejecutá esta consulta JOIN para ver relaciones entre tablas.",
    query: "SELECT u.name, m.title, w.watched_at FROM users u JOIN watch_history w ON u.id = w.user_id JOIN movies m ON w.movie_id = m.id LIMIT 10",
    hint: "Ejecutá la query haciendo click en 'Ejecutar consulta'",
    step: 2,
    total: 3
  },
  {
    id: "filter",
    icon: Filter,
    title: "Buscar por condición",
    description: "Ejecutá esta query con WHERE para filtrar películas.",
    query: "SELECT title, rating FROM movies WHERE rating > 8.0 ORDER BY rating DESC",
    hint: "Ejecutá la query haciendo click en 'Ejecutar consulta'",
    step: 3,
    total: 3
  }
]

interface QuickStartState {
  completed: Set<string>
  currentQuery: string
  executing: boolean
}

export function QuickStartDialog({ open, onClose, onExecute, onQueryComplete }: QuickStartDialogProps) {
  const [state, setState] = useState<QuickStartState>({
    completed: new Set(),
    currentQuery: "",
    executing: false
  })

  useEffect(() => {
    if (!open) {
      setState({
        completed: new Set(),
        currentQuery: "",
        executing: false
      })
    }
  }, [open])

  const { completed, currentQuery, executing } = state

  const handleExerciseClick = (exercise: Exercise) => {
    if (completed.has(exercise.id)) return
    setState(prev => ({
      ...prev,
      currentQuery: exercise.query,
      executing: false
    }))
  }

  const handleRun = async () => {
    if (!currentQuery || executing) return

    const exercise = exercises.find((e) => e.query === currentQuery)
    if (!exercise) return

    setState(prev => ({
      ...prev,
      executing: true
    }))

    try {
      await onExecute(currentQuery)

      setState(prev => ({
        ...prev,
        executing: false,
        completed: new Set([...prev.completed, exercise.id])
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        executing: false
      }))
    }

    if (completed.size + 1 === exercises.length) {
      setTimeout(() => {
        onClose()
        if (onQueryComplete) onQueryComplete()
      }, 500)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-accent transition-colors z-10"
          aria-label="Cerrar Quick Start"
        >
          <X className="size-5" />
        </button>

        <Card className="flex flex-col max-h-[90vh] border border-border bg-background">
          <div className="flex items-center gap-3 p-4 border-b border-border shrink-0">
            <div className="size-10 flex items-center justify-center rounded bg-accent/10">
              <Sparkles className="size-5 text-accent" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">
                Bienvenido a QueryLab
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="sharp" className="text-[10px]">
                  Quick Start
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {completed.size} de {exercises.length} ejercicios completados
                </span>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {exercises.map((exercise) => {
                const isCompleted = completed.has(exercise.id)
                const isCurrent = !isCompleted && currentQuery === exercise.query && !executing

                return (
                  <Card
                    key={exercise.id}
                    className={`p-4 border border-border transition-all ${
                      isCurrent
                        ? "border-accent bg-accent/5"
                        : isCompleted
                        ? "border-accent/30 opacity-60"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className={`size-8 flex items-center justify-center rounded ${
                          isCompleted
                            ? "bg-accent/20 text-accent"
                            : "bg-muted"
                        }`}>
                          <exercise.icon className="size-4" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="sharp" className="text-[10px]">
                            Paso {exercise.step}/{exercise.total}
                          </Badge>
                          {isCompleted && (
                            <Badge variant="sharp" className="text-[10px] bg-accent text-background">
                              <Check className="size-2 mr-0.5" />
                              Completado
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-foreground mb-1">
                          {exercise.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          {exercise.description}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-muted/50 rounded border border-border/50">
                            <span className="text-[10px] text-accent">
                              <Zap className="inline size-3 mr-1" />
                              Click en: {exercise.hint}
                            </span>
                            {isCompleted && (
                              <Check className="size-3 text-accent" />
                            )}
                          </div>
                          <Button
                            variant={isCurrent ? "sharp-accent" : "sharp"}
                            size="sm"
                            onClick={() => handleExerciseClick(exercise)}
                            disabled={isCompleted || executing}
                            className="w-full justify-start gap-2"
                          >
                            <ArrowRight className={`size-3 transition-transform ${isCurrent ? "translate-x-1" : ""}`} />
                            {isCurrent
                              ? "Ejecutar consulta"
                              : "Ya ejecutado"}
                          </Button>
                          {!isCurrent && !isCompleted && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRun}
                              disabled={!currentQuery || executing}
                              className="w-full justify-center gap-2"
                            >
                              {executing ? (
                                <>
                                  <Loader2 className="size-3 animate-spin" />
                                  Ejecutando...
                                </>
                              ) : (
                                <>
                                  <ArrowRight className="size-3" />
                                  Ejecutar consulta
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                        {executing && currentQuery === exercise.query && (
                          <div className="mt-3 p-2 bg-accent/10 border border-accent/30 rounded text-xs text-accent text-center">
                            <Loader2 className="size-3 inline animate-spin" />
                            <span className="ml-2">Ejecutando query...</span>
                          </div>
                        )}
                        {completed.has(exercise.id) && (
                          <div className="mt-3 p-2 bg-accent/10 border border-accent/30 rounded text-xs text-accent text-center">
                            <Check className="size-3 inline" />
                            <span className="ml-2">Query ejecutada correctamente</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>

          {currentQuery && (
            <div className="p-3 border-t border-border bg-muted/20 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[10px]">
                  {exercises.find((e) => e.query === currentQuery)?.step}
                  /{exercises.find((e) => e.query === currentQuery)?.total}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {completed.size + 1} de {exercises.length} ejercicios completados
                </span>
              </div>
              <div className="p-2 bg-background border border-border rounded text-xs font-mono text-muted-foreground break-all">
                {currentQuery}
              </div>
            </div>
          )}

          {completed.size === exercises.length && (
            <div className="p-4 border-t border-border bg-accent/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-accent">
                  ¡Quick Start completado!
                </span>
                <Button variant="outline" size="sm" onClick={onClose}>
                  Comenzar
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}