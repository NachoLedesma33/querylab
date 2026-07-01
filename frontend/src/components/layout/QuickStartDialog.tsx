import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Check, ArrowRight, Sparkles, Database, GitBranch, Filter } from "lucide-react"

interface QuickStartDialogProps {
  open: boolean
  onClose: () => void
  onExecute: (query: string) => void
  onQueryComplete?: () => void
}

const exercises = [
  {
    id: "explore",
    icon: Database,
    title: "Explorar una tabla",
    description: "Haz clic en una tabla en el sidebar y usa el botón de play para ver todos sus datos.",
    query: "SELECT * FROM movies",
    hint: "Dale play a la tabla 'movies' en el sidebar izquierdo",
    step: 1,
    total: 3
  },
  {
    id: "join",
    icon: GitBranch,
    title: "Hacer una JOIN",
    description: "Conecta tablas relacionadas con una consulta JOIN para ver datos relacionados.",
    query: "SELECT u.name, m.title, w.watched_at FROM users u JOIN watch_history w ON u.id = w.user_id JOIN movies m ON w.movie_id = m.id LIMIT 10",
    hint: "Esta query une users, watch_history y movies en una sola consulta",
    step: 2,
    total: 3
  },
  {
    id: "filter",
    icon: Filter,
    title: "Buscar por condición",
    description: "Filtra datos usando la cláusula WHERE para encontrar registros específicos.",
    query: "SELECT title, rating FROM movies WHERE rating > 8.0 ORDER BY rating DESC",
    hint: "Buscá películas con rating superior a 8.0",
    step: 3,
    total: 3
  }
]

export function QuickStartDialog({ open, onClose, onExecute, onQueryComplete }: QuickStartDialogProps) {
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [currentQuery, setCurrentQuery] = useState<string>("")

  useEffect(() => {
    if (!open) return
    setCurrentQuery("")
    setCompleted(new Set())
  }, [open])

  const handleExerciseClick = (exercise: typeof exercises[0]) => {
    setCurrentQuery(exercise.query)
  }

  const handleRun = () => {
    onExecute(currentQuery)
    const exercise = exercises.find((e) => e.query === currentQuery)
    if (exercise) {
      setCompleted((prev) => new Set([...prev, exercise.id]))
      if (completed.size + 1 === exercises.length) {
        setTimeout(() => {
          onClose()
          if (onQueryComplete) onQueryComplete()
        }, 2000)
      }
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
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Bienvenido a QueryLab
              </h2>
              <p className="text-sm text-muted-foreground">
                3 ejercicios guiados para familiarizarte
              </p>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {exercises.map((exercise) => {
                const isCompleted = completed.has(exercise.id)
                const isCurrent = !isCompleted && currentQuery === exercise.query

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
                          <Button
                            variant={isCurrent ? "sharp-accent" : "sharp"}
                            size="sm"
                            onClick={() => handleExerciseClick(exercise)}
                            disabled={isCompleted}
                            className="w-full justify-start gap-2"
                          >
                            <ArrowRight className={`size-3 transition-transform ${isCurrent ? "translate-x-1" : ""}`} />
                            Ejecutar consulta
                          </Button>
                          {!isCompleted && currentQuery === exercise.query && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRun}
                              disabled={!currentQuery}
                              className="w-full justify-center gap-2"
                            >
                              <ArrowRight className="size-3" />
                              Ejecutar
                            </Button>
                          )}
                        </div>
                        <div className="mt-3">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            💡 {exercise.hint}
                          </span>
                        </div>
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
        </Card>
      </div>
    </div>
  )
}