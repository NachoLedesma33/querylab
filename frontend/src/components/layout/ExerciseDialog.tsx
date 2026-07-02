import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { exercises, difficultyLabels, difficultyColors, difficultyBgHover, type Difficulty, type Exercise } from "@/data/exercises"
import { X, Lightbulb, Code, CheckCircle2, Circle, ArrowRight, ListOrdered, GraduationCap, Trophy } from "lucide-react"

const STORAGE_KEY = "querylab-exercises-progress"

function loadProgress(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return new Set(JSON.parse(raw))
  } catch { /* ignore */ }
  return new Set()
}

function saveProgress(ids: Set<number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

interface ExerciseDialogProps {
  open: boolean
  onClose: () => void
  onLoadQuery: (query: string) => void
  onSelect: (exercise: Exercise) => void
}

const difficulties: Difficulty[] = ["basic", "intermediate", "advanced"]

export function ExerciseDialog({ open, onClose, onLoadQuery, onSelect }: ExerciseDialogProps) {
  const [filter, setFilter] = useState<Difficulty | "all">("all")
  const [selectedId, setSelectedId] = useState<number>(1)
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [completed, setCompleted] = useState<Set<number>>(loadProgress)

  useEffect(() => {
    saveProgress(completed)
  }, [completed])

  const filtered = useMemo(() => {
    return filter === "all" ? exercises : exercises.filter((e) => e.difficulty === filter)
  }, [filter])

  const selected = useMemo(() => exercises.find((e) => e.id === selectedId)!, [selectedId])

  const grouped = useMemo(() => {
    const g: Record<Difficulty, Exercise[]> = { basic: [], intermediate: [], advanced: [] }
    for (const e of filtered) {
      g[e.difficulty].push(e)
    }
    return g
  }, [filtered])

  const stats = useMemo(() => {
    const total = exercises.length
    const done = completed.size
    const byDiff = difficulties.map((d) => {
      const totalD = exercises.filter((e) => e.difficulty === d).length
      const doneD = exercises.filter((e) => e.difficulty === d && completed.has(e.id)).length
      return { diff: d, total: totalD, done: doneD }
    })
    return { total, done, byDiff }
  }, [completed])

  const handleToggleComplete = (id: number) => {
    setCompleted((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleLoadSolution = () => {
    onLoadQuery(selected.solution)
    onSelect(selected)
    handleToggleComplete(selected.id)
    setShowSolution(false)
    setShowHint(false)
  }

  const handleSelect = (ex: Exercise) => {
    setSelectedId(ex.id)
    onSelect(ex)
    setShowHint(false)
    setShowSolution(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-black/60 p-4" onClick={onClose}>
      <Card className="relative w-full max-w-4xl h-[85vh] border border-border bg-background shadow-2xl flex" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-1.5 text-muted-foreground hover:text-foreground transition-colors" aria-label="Cerrar">
          <X className="size-5" />
        </button>

        {/* Left panel: list */}
        <div className="w-[280px] shrink-0 border-r border-border flex flex-col">
          <div className="p-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="size-5 text-accent" />
              <h2 className="text-base font-bold text-foreground">Ejercicios</h2>
            </div>
            <div className="flex items-center gap-1.5 mb-2">
              {(["all", ...difficulties] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setFilter(d)}
                  className={`text-[10px] px-2 py-0.5 border transition-colors ${
                    filter === d ? "border-accent text-accent" : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d === "all" ? "Todos" : difficultyLabels[d]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Trophy className="size-3 text-accent" />
              <span>{stats.done}/{stats.total} completados</span>
            </div>
          </div>
          <ScrollArea className="flex-1">
            {difficulties.map((diff) => {
              const items = grouped[diff]
              if (items.length === 0) return null
              return (
                <div key={diff}>
                  <div className="px-4 py-1.5 text-[9px] font-semibold tracking-wider text-muted-foreground uppercase bg-muted/10 border-b border-border/30">
                    {difficultyLabels[diff]} ({stats.byDiff.find((b) => b.diff === diff)!.done}/{items.length})
                  </div>
                  {items.map((ex) => {
                    const isSelected = selectedId === ex.id
                    const isCompleted = completed.has(ex.id)
                    return (
                      <button
                        key={ex.id}
                        onClick={() => handleSelect(ex)}
                        className={`w-full text-left px-4 py-2 border-b border-border/20 flex items-center gap-2 transition-colors ${
                          isSelected
                            ? "bg-accent/[0.04] border-l-2 border-l-accent"
                            : `hover:bg-muted/20 ${difficultyBgHover[ex.difficulty]}`
                        }`}
                      >
                        <span className="text-[10px] font-mono text-muted-foreground w-5 shrink-0">{ex.id}.</span>
                        <span className={`text-xs truncate flex-1 ${isSelected ? "text-accent font-medium" : "text-foreground/80"}`}>
                          {ex.title}
                        </span>
                        {isCompleted ? (
                          <CheckCircle2 className="size-3 text-green-400 shrink-0" />
                        ) : (
                          <Circle className="size-3 text-muted-foreground/30 shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </ScrollArea>
        </div>

        {/* Right panel: detail */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-5 pb-3 border-b border-border">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-muted-foreground">#{selected.id}</span>
                  <Badge variant="sharp" className={`text-[9px] ${difficultyColors[selected.difficulty]}`}>
                    {difficultyLabels[selected.difficulty]}
                  </Badge>
                  {selected.category && (
                    <span className="text-[9px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 border border-border/50">
                      {selected.category}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-foreground">{selected.title}</h3>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
                  <Code className="size-3" />
                  <span>Tablas: {selected.tables.join(", ")}</span>
                </div>
              </div>
              <Button
                variant="sharp-accent"
                size="icon-xs"
                className="size-7 shrink-0"
                onClick={() => handleToggleComplete(selected.id)}
                aria-label={completed.has(selected.id) ? "Marcar como incompleto" : "Marcar como completado"}
              >
                {completed.has(selected.id) ? <CheckCircle2 className="size-3.5 text-green-400" /> : <Circle className="size-3.5" />}
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-5">
            <div className="mb-5">
              <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <ListOrdered className="size-3 text-accent" />
                Consigna
              </h4>
              <div className="text-[13px] text-foreground/80 leading-relaxed">{selected.description}</div>
            </div>

            {/* Hint */}
            {selected.hint && (
              <div className="mb-4">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors"
                >
                  <Lightbulb className={`size-3.5 ${showHint ? "text-accent" : ""}`} />
                  {showHint ? "Ocultar pista" : "Mostrar pista"}
                </button>
                {showHint && (
                  <div className="mt-2 p-3 bg-amber-400/[0.04] border border-amber-400/20 text-xs text-foreground/80 leading-relaxed">
                    💡 {selected.hint}
                  </div>
                )}
              </div>
            )}

            {/* Solution */}
            <div className="mb-4">
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors"
              >
                <Code className={`size-3.5 ${showSolution ? "text-accent" : ""}`} />
                {showSolution ? "Ocultar solución" : "Mostrar solución"}
              </button>
              {showSolution && (
                <div className="mt-2">
                  <pre className="p-3 bg-muted/30 border border-accent/30 rounded text-xs font-mono text-accent overflow-x-auto whitespace-pre-wrap">
                    {selected.solution}
                  </pre>
                  <Button
                    variant="sharp-accent"
                    size="sm"
                    onClick={handleLoadSolution}
                    className="mt-2 gap-1.5"
                  >
                    <ArrowRight className="size-3" />
                    Cargar solución en el editor
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Bottom stats bar */}
          <div className="px-5 py-2 border-t border-border text-[10px] text-muted-foreground flex items-center gap-3">
            <span>{exercises.findIndex((e) => e.id === selected.id) + 1} de {exercises.length}</span>
            <span className="text-muted-foreground/40">|</span>
            <span>{difficultyLabels[selected.difficulty]}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}