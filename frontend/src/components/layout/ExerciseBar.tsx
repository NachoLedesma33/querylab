import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Exercise } from "@/data/exercises"
import { difficultyLabels, difficultyColors } from "@/data/exercises"
import { X, Lightbulb, Code, ArrowRight, ListOrdered } from "lucide-react"

interface ExerciseBarProps {
  exercise: Exercise
  onLoadSolution: (query: string) => void
  onDismiss: () => void
}

export function ExerciseBar({ exercise, onLoadSolution, onDismiss }: ExerciseBarProps) {
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)

  return (
    <div className="border-b border-border bg-muted/20">
      <div className="flex items-start gap-3 px-4 py-2.5">
        {/* Icon + title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-[10px] font-mono text-muted-foreground shrink-0">#{exercise.id}</span>
          <Badge variant="sharp" className={`text-[9px] shrink-0 ${difficultyColors[exercise.difficulty]}`}>
            {difficultyLabels[exercise.difficulty]}
          </Badge>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-foreground truncate block leading-tight">{exercise.title}</span>
            {exercise.category && (
              <span className="text-[9px] text-muted-foreground/60">{exercise.category}</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {exercise.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className={`flex items-center gap-1 text-[10px] px-2 py-1 border transition-colors ${
                showHint ? "border-amber-400/50 text-amber-400" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lightbulb className="size-3" />
              Pista
            </button>
          )}
          <button
            onClick={() => setShowSolution(!showSolution)}
            className={`flex items-center gap-1 text-[10px] px-2 py-1 border transition-colors ${
              showSolution ? "border-accent text-accent" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code className="size-3" />
            Solución
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
        <div className="px-4 pb-2.5">
          <div className="p-2 bg-amber-400/[0.04] border border-amber-400/20 text-[11px] text-foreground/70 leading-relaxed">
            💡 {exercise.hint}
          </div>
        </div>
      )}
      {showSolution && (
        <div className="px-4 pb-2.5">
          <pre className="p-2 bg-muted/30 border border-accent/30 text-[11px] font-mono text-accent overflow-x-auto whitespace-pre-wrap">
            {exercise.solution}
          </pre>
        </div>
      )}

      {/* Description (always visible) */}
      <div className="px-4 pb-2.5 text-[11px] text-foreground/60 leading-relaxed flex items-start gap-1.5">
        <ListOrdered className="size-3 text-accent shrink-0 mt-0.5" />
        <span>{exercise.description}</span>
      </div>
    </div>
  )
}