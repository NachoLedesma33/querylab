import { useState, useCallback, useRef, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Exercise } from "@/data/exercises"
import { exercises as allExercises, difficultyLabels, difficultyColors } from "@/data/exercises"
import { X, Lightbulb, Code, ArrowRight, ListOrdered, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"

interface ExerciseBarProps {
  exercise: Exercise
  onLoadSolution: (query: string) => void
  onDismiss: () => void
  onNavigate: (id: number) => void
}

export function ExerciseBar({ exercise, onLoadSolution, onDismiss, onNavigate }: ExerciseBarProps) {
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [selectorFilter, setSelectorFilter] = useState<"all" | "basic" | "intermediate" | "advanced">("all")
  const selectorRef = useRef<HTMLDivElement>(null)

  const filtered = selectorFilter === "all" ? allExercises : allExercises.filter((e) => e.difficulty === selectorFilter)

  const currentIdx = allExercises.findIndex((e) => e.id === exercise.id)
  const hasPrev = currentIdx > 0
  const hasNext = currentIdx < allExercises.length - 1

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setSelectorOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handlePrev = useCallback(() => {
    if (hasPrev) onNavigate(allExercises[currentIdx - 1].id)
  }, [currentIdx, hasPrev, onNavigate])

  const handleNext = useCallback(() => {
    if (hasNext) onNavigate(allExercises[currentIdx + 1].id)
  }, [currentIdx, hasNext, onNavigate])

  return (
    <div className="border-b border-border bg-muted/20">
      {/* Top row: navigation + title + actions */}
      <div className="flex items-center gap-2 px-3 py-1.5">
        {/* Prev/Next */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={handlePrev} disabled={!hasPrev} className={`p-0.5 border transition-colors ${hasPrev ? "border-border text-muted-foreground hover:text-foreground hover:border-accent cursor-pointer" : "border-border/30 text-muted-foreground/30 cursor-not-allowed"}`} aria-label="Ejercicio anterior">
            <ChevronLeft className="size-3" />
          </button>
          <button onClick={handleNext} disabled={!hasNext} className={`p-0.5 border transition-colors ${hasNext ? "border-border text-muted-foreground hover:text-foreground hover:border-accent cursor-pointer" : "border-border/30 text-muted-foreground/30 cursor-not-allowed"}`} aria-label="Ejercicio siguiente">
            <ChevronRight className="size-3" />
          </button>
        </div>

        {/* Exercise selector (clickable title) */}
        <div className="relative shrink-0" ref={selectorRef}>
          <button onClick={() => setSelectorOpen(!selectorOpen)} className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground hover:text-accent transition-colors cursor-pointer bg-transparent border-0 p-0">
            <span className="text-[10px] font-mono text-muted-foreground">#{exercise.id}</span>
            <span className="truncate max-w-[180px]">{exercise.title}</span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </button>

          {selectorOpen && (
            <div className="absolute top-full left-0 mt-1 w-[280px] bg-background border border-border shadow-xl z-50 max-h-[320px] flex flex-col">
              <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border">
                {(["all", "basic", "intermediate", "advanced"] as const).map((d) => (
                  <button key={d} onClick={() => setSelectorFilter(d)} className={`text-[9px] px-1.5 py-0.5 border transition-colors ${selectorFilter === d ? "border-accent text-accent" : "border-border text-muted-foreground hover:text-foreground"}`}>
                    {d === "all" ? "Todos" : difficultyLabels[d]}
                  </button>
                ))}
              </div>
              <div className="overflow-y-auto flex-1">
                {filtered.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => { onNavigate(ex.id); setSelectorOpen(false) }}
                    className={`w-full text-left px-3 py-1.5 flex items-center gap-2 text-[11px] transition-colors ${ex.id === exercise.id ? "bg-accent/[0.06] text-accent font-medium" : "text-foreground/70 hover:bg-muted/20"}`}
                  >
                    <span className="text-[9px] font-mono text-muted-foreground w-4 shrink-0">{ex.id}.</span>
                    <span className="truncate flex-1">{ex.title}</span>
                    <Badge variant="sharp" className={`text-[8px] ${difficultyColors[ex.difficulty]}`}>
                      {difficultyLabels[ex.difficulty][0]}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Difficulty badge */}
        <Badge variant="sharp" className={`text-[9px] shrink-0 ${difficultyColors[exercise.difficulty]}`}>
          {difficultyLabels[exercise.difficulty]}
        </Badge>
        {exercise.category && (
          <span className="text-[9px] text-muted-foreground/60 hidden sm:inline">{exercise.category}</span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {exercise.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className={`flex items-center gap-1 text-[10px] px-2 py-1 border transition-colors ${
                showHint ? "border-amber-400/50 text-amber-400" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lightbulb className="size-3" />
              <span className="hidden sm:inline">Pista</span>
            </button>
          )}
          <button
            onClick={() => setShowSolution(!showSolution)}
            className={`flex items-center gap-1 text-[10px] px-2 py-1 border transition-colors ${
              showSolution ? "border-accent text-accent" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code className="size-3" />
            <span className="hidden sm:inline">Solución</span>
          </button>
          <Button variant="sharp-accent" size="xs" onClick={() => onLoadSolution(exercise.solution)} className="gap-1">
            <ArrowRight className="size-3" />
            Cargar
          </Button>
          <button onClick={onDismiss} className="p-1 text-muted-foreground hover:text-foreground transition-colors" aria-label="Cerrar ejercicio">
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable sections */}
      {showHint && exercise.hint && (
        <div className="px-3 pb-1.5">
          <div className="p-2 bg-amber-400/[0.04] border border-amber-400/20 text-[11px] text-foreground/70 leading-relaxed">
            💡 {exercise.hint}
          </div>
        </div>
      )}
      {showSolution && (
        <div className="px-3 pb-1.5">
          <pre className="p-2 bg-muted/30 border border-accent/30 text-[11px] font-mono text-accent overflow-x-auto whitespace-pre-wrap">
            {exercise.solution}
          </pre>
        </div>
      )}

      {/* Description (always visible) */}
      <div className="px-3 pb-1.5 text-[11px] text-foreground/60 leading-relaxed flex items-start gap-1.5">
        <ListOrdered className="size-3 text-accent shrink-0 mt-0.5" />
        <span>{exercise.description}</span>
      </div>
    </div>
  )
}