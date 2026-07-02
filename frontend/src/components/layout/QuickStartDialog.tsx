import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, Sparkles, Database, GitBranch, Filter, ChevronDown, X } from "lucide-react"

interface DemoResult {
  columns: string[]
  rows: string[][]
}

interface Exercise {
  id: string
  icon: typeof Database
  title: string
  description: string
  query: string
  result: DemoResult
}

const exercises: Exercise[] = [
  {
    id: "explore",
    icon: Database,
    title: "Explorar una tabla",
    description: "SELECT * FROM movies muestra todas las películas disponibles en la plataforma.",
    query: "SELECT * FROM movies",
    result: {
      columns: ["id", "title", "genre", "release_year", "rating", "duration", "director"],
      rows: [
        ["1", "The Matrix", "Sci-Fi", "1999", "8.7", "136", "Lana Wachowski"],
        ["2", "Inception", "Sci-Fi", "2010", "8.8", "148", "Christopher Nolan"],
        ["3", "Parasite", "Drama", "2019", "8.5", "132", "Bong Joon-ho"],
        ["4", "Spirited Away", "Animation", "2001", "8.6", "125", "Hayao Miyazaki"],
        ["5", "The Dark Knight", "Action", "2008", "9.0", "152", "Christopher Nolan"],
      ]
    }
  },
  {
    id: "join",
    icon: GitBranch,
    title: "Hacer una JOIN",
    description: "Combiná datos de varias tablas con JOIN para ver qué películas miró cada usuario.",
    query: "SELECT u.name, m.title FROM users u JOIN watch_history w ON u.id = w.user_id JOIN movies m ON w.movie_id = m.id LIMIT 10",
    result: {
      columns: ["name", "title"],
      rows: [
        ["Alice Johnson", "The Matrix"],
        ["Alice Johnson", "Inception"],
        ["Bob Smith", "The Dark Knight"],
        ["Carlos Lopez", "Parasite"],
        ["Diana Prince", "Interstellar"],
        ["Eve Martinez", "Pulp Fiction"],
        ["Alice Johnson", "Spirited Away"],
        ["Bob Smith", "Inception"],
        ["Carlos Lopez", "The Matrix"],
        ["Diana Prince", "The Dark Knight"],
      ]
    }
  },
  {
    id: "filter",
    icon: Filter,
    title: "Buscar por condición",
    description: "Filtrá resultados con WHERE para encontrar películas con rating superior a 8.0.",
    query: "SELECT title, rating FROM movies WHERE rating > 8.0 ORDER BY rating DESC",
    result: {
      columns: ["title", "rating"],
      rows: [
        ["The Shawshank Redemption", "9.3"],
        ["The Dark Knight", "9.0"],
        ["Pulp Fiction", "8.9"],
        ["Inception", "8.8"],
        ["The Matrix", "8.7"],
        ["Interstellar", "8.7"],
        ["Spirited Away", "8.6"],
        ["Parasite", "8.5"],
      ]
    }
  }
]

interface QuickStartDialogProps {
  open: boolean
  onClose: () => void
}

export function QuickStartDialog({ open, onClose }: QuickStartDialogProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [expandedResult, setExpandedResult] = useState<string | null>(null)

  const handleClose = () => {
    try { localStorage.setItem("querylab-onboarding", "completed") } catch {}
    onClose()
  }

  const handleComplete = (id: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev)
      next.add(id)
      if (next.size >= exercises.length) {
        try { localStorage.setItem("querylab-onboarding", "completed") } catch {}
        setTimeout(() => onClose(), 400)
      }
      return next
    })
    setExpandedResult(id)
  }

  if (!open) return null

  const allCompleted = completedIds.size >= exercises.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={handleClose}>
      <Card
        className="relative w-full max-w-xl border border-border bg-background shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cerrar Quick Start"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3 p-6 pb-3 border-b border-border shrink-0">
          <div className="size-10 flex items-center justify-center rounded bg-accent/10">
            <Sparkles className="size-5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Bienvenido a QueryLab</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Completá los 3 ejercicios para aprender lo básico
            </p>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6 pt-4">
          <div className="space-y-3">
            {exercises.map((ex, i) => {
              const isCompleted = completedIds.has(ex.id)
              const isExpanded = expandedResult === ex.id

              return (
                <div
                  key={ex.id}
                  className={`border rounded transition-all ${
                    isCompleted ? "border-accent/30" :
                    isExpanded ? "border-accent" :
                    "border-border hover:border-accent/40"
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`size-9 flex items-center justify-center rounded shrink-0 ${
                        isCompleted ? "bg-accent/20 text-accent" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        <ex.icon className="size-4" />
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
                        <p className="text-xs text-muted-foreground mb-2">{ex.description}</p>

                        <div className="p-2 bg-muted/30 border border-border rounded mb-2 font-mono text-[11px] text-accent break-all">
                          {ex.query}
                        </div>

                        {isExpanded && (
                          <div className="mb-3 overflow-x-auto">
                            <table className="w-full text-[10px] border-collapse">
                              <thead>
                                <tr className="border-b border-border">
                                  {ex.result.columns.map((col) => (
                                    <th key={col} className="text-left py-1 px-1.5 text-muted-foreground uppercase tracking-wider font-semibold whitespace-nowrap">
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {ex.result.rows.map((row, ri) => (
                                  <tr key={ri} className="border-b border-border/30 last:border-0">
                                    {row.map((cell, ci) => (
                                      <td key={ci} className="py-0.5 px-1.5 text-foreground whitespace-nowrap">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div className="text-[9px] text-muted-foreground mt-1">
                              Mostrando {ex.result.rows.length} filas
                            </div>
                          </div>
                        )}

                        <div className="flex gap-1.5">
                          <Button
                            variant={isCompleted ? "ghost" : "sharp-accent"}
                            size="sm"
                            onClick={() => handleComplete(ex.id)}
                            disabled={isCompleted}
                            className="flex-1 justify-center gap-1.5 h-7 text-[11px]"
                          >
                            {isCompleted ? (
                              <><Check className="size-3" /> Completado</>
                            ) : (
                              <>{isExpanded ? "Ocultar resultados" : "Ver resultados"}</>
                            )}
                          </Button>
                          {!isExpanded && (
                            <Button
                              variant="sharp"
                              size="sm"
                              onClick={() => setExpandedResult(ex.id)}
                              className="h-7 px-2"
                            >
                              <ChevronDown className="size-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        <div className="px-6 pb-5 pt-3 border-t border-border flex items-center justify-between shrink-0">
          <span className="text-xs text-muted-foreground">
            {completedIds.size} de {exercises.length} ejercicios completados
            {completedIds.size > 0 && (
              <span className="ml-1">({Math.round(completedIds.size / exercises.length * 100)}%)</span>
            )}
          </span>
          {allCompleted ? (
            <Button variant="sharp-accent" size="sm" onClick={handleClose}>
              <Check className="size-3 mr-1" /> Comenzar
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Saltar tutorial
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}