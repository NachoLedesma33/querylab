import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import type { PipelineStep, PipelineState } from "./pipeline-types"
import { Scan, Link, Filter, Play, SkipForward } from "lucide-react"

interface StepPipelineProps {
  pipeline: PipelineState
  onStart: () => void
  onNext: () => void
  onReset: () => void
  tables: string[]
}

const steps: { key: PipelineStep; label: string; icon: typeof Scan }[] = [
  { key: "scan", label: "Escanear", icon: Scan },
  { key: "join", label: "Unir", icon: Link },
  { key: "filter", label: "Filtrar", icon: Filter },
]

export function StepPipeline({
  pipeline,
  onStart,
  onNext,
  onReset,
  tables,
}: StepPipelineProps) {
  return (
    <div className="flex items-center gap-2 px-4 h-10 border-b border-border bg-muted/20 shrink-0">
      <span className="text-xs font-medium text-muted-foreground mr-1">
        Pipeline
      </span>
      {steps.map(({ key, label, icon: Icon }) => {
        const isActive = pipeline.currentStep === key
        const isDone = pipeline.completedSteps.includes(key)
        return (
          <Badge
            key={key}
            variant={isDone ? "default" : isActive ? "secondary" : "outline"}
            className={`gap-1 text-[11px] px-2 py-0.5 transition-all ${
              isActive ? "ring-1 ring-indigo-400" : ""
            }`}
          >
            <Icon className="size-3" />
            {label}
            {isDone && " ✓"}
          </Badge>
        )
      })}

      {tables.length > 0 && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-2">
          <span className="text-muted-foreground/60">Tablas:</span>
          {tables.map((t) => (
            <code key={t} className="text-indigo-400">{t}</code>
          ))}
        </div>
      )}

      <div className="ml-auto flex items-center gap-1">
        {!pipeline.active ? (
          <Button size="xs" onClick={onStart} aria-label="Iniciar animación del pipeline">
            <Play className="size-3" />
            Animar
          </Button>
        ) : (
          <>
            <Button size="xs" onClick={onNext} aria-label="Siguiente paso">
              <SkipForward className="size-3" />
              Siguiente
            </Button>
            {pipeline.currentStep === "filter" && (
              <Button size="xs" variant="outline" onClick={onReset} aria-label="Reiniciar pipeline">
                Reiniciar
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
