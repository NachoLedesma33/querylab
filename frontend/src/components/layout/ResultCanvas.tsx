import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { QueryVisualizer } from "@/components/flow/QueryVisualizer"
import { StepPipeline } from "@/components/flow/StepPipeline"
import type { QueryResponse } from "@/types"
import type { PipelineStep, PipelineState } from "@/components/flow/pipeline-types"
import {
  Brain,
  AlertCircle,
  Play,
  Table2,
  Timer,
  ArrowRight,
  GitBranch,
} from "lucide-react"

interface ResultCanvasProps {
  status: "idle" | "loading" | "error" | "success"
  result: QueryResponse | null
  error: string | null
  onExecute: () => void
}

const stepOrder: PipelineStep[] = ["scan", "join", "filter"]

function EmptyState({ onExecute }: { onExecute: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
      <div className="size-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center ring-1 ring-indigo-500/20">
        <Brain className="size-8 text-indigo-400" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground">
          Listo para consultar
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Escribí una consulta SQL en el editor de arriba y presioná{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">
            Ejecutar
          </kbd>{" "}
          para ver los resultados aquí.
        </p>
      </div>
      <Button size="sm" onClick={onExecute} aria-label="Ejecutar consulta">
        <Play className="size-3.5" />
        Ejecutar consulta
      </Button>
    </div>
  )
}

function LoadingState() {
  return (
      <div className="p-6 space-y-4" role="status" aria-label="Cargando resultados">
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-px w-full" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  const isSecurity = message.includes("⚠ Security:") || message.toLowerCase().includes("forbidden") || message.toLowerCase().includes("bloqueada")
  const isTimeout = message.toLowerCase().includes("timeout") || message.toLowerCase().includes("tiempo")
  const isTooMany = message.toLowerCase().includes("too many requests") || message.toLowerCase().includes("demasiadas")
  const isReset = message.startsWith("Reset failed") || message.startsWith("Error al restaurar")

  let suggestion = ""
  if (isSecurity) suggestion = "Probá con una consulta SELECT simple como: SELECT * FROM movies LIMIT 5"
  else if (isTimeout) suggestion = "Agregá una cláusula LIMIT para reducir la cantidad de resultados."
  else if (isTooMany) suggestion = "Esperá un momento y volvé a intentar."
  else if (isReset) suggestion = "Ocurrió un error al restaurar la base de datos. Intentá de nuevo en un momento."

  return (
    <div className="p-6">
      <Alert variant={isSecurity ? "default" : "destructive"}>
        <AlertCircle className={isSecurity ? "size-4 text-orange-400" : "size-4"} />
        <AlertTitle>
          {isSecurity ? "⚠ Consulta bloqueada" : isTimeout ? "⏱ Tiempo agotado" : isTooMany ? "⏳ Demasiadas solicitudes" : "Error"}
        </AlertTitle>
        <AlertDescription className="font-mono text-sm mt-1">
          {message}
        </AlertDescription>
        {suggestion && (
          <p className="text-xs text-muted-foreground mt-2 border-t border-border/50 pt-2">
            💡 {suggestion}
          </p>
        )}
      </Alert>
    </div>
  )
}

function SuccessState({ result }: { result: QueryResponse }) {
  const columns = result.columns.length > 0
    ? result.columns
    : result.result.length > 0
      ? Object.keys(result.result[0])
      : []

  return (
    <div className="flex flex-col h-full" role="region" aria-label="Resultados de la consulta">
      <div className="flex items-center gap-3 px-4 h-10 border-b border-border shrink-0">
        <Badge variant="secondary" className="gap-1">
          <Table2 className="size-3" />
          {result.rows} fila{result.rows !== 1 ? "s" : ""}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Timer className="size-3" />
          {result.executionTimeMs}ms
        </Badge>
        {result.tables.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
            <span>Tablas:</span>
            {result.tables.map((t, i) => (
              <span key={t}>
                <code className="text-indigo-400">{t}</code>
                {i < result.tables.length - 1 && (
                  <ArrowRight className="size-3 inline mx-0.5" />
                )}
              </span>
            ))}
          </div>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          {result.result.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Consulta ejecutada correctamente. No se devolvieron filas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table
                className="w-full text-sm border-collapse"
                role="table"
                aria-label="Resultados de la consulta"
              >
                <thead>
                  <tr className="border-b border-border">
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider"
                        scope="col"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.result.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      {columns.map((col) => (
                        <td
                          key={col}
                          className="px-3 py-2 text-sm font-mono text-foreground/90"
                        >
                          {String(row[col] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export function ResultCanvas({
  status,
  result,
  error,
  onExecute,
}: ResultCanvasProps) {
  const [view, setView] = useState<"results" | "graph">("results")
  const [pipeline, setPipeline] = useState<PipelineState>({
    active: false,
    currentStep: null,
    completedSteps: [],
  })

  const tables = result?.tables ?? []

  const handleStartPipeline = useCallback(() => {
    setPipeline({
      active: true,
      currentStep: "scan",
      completedSteps: [],
    })
  }, [])

  const handleNextPipeline = useCallback(() => {
    setPipeline((prev) => {
      if (!prev.currentStep) return prev
      const idx = stepOrder.indexOf(prev.currentStep)
      const nextStep = idx < stepOrder.length - 1 ? stepOrder[idx + 1] : null
      return {
        active: nextStep !== null,
        currentStep: nextStep,
        completedSteps: [...prev.completedSteps, prev.currentStep],
      }
    })
  }, [])

  const handleResetPipeline = useCallback(() => {
    setPipeline({
      active: false,
      currentStep: null,
      completedSteps: [],
    })
  }, [])

  return (
    <Card
      className="flex-1 min-h-0 rounded-none border-0 border-t border-border bg-canvas overflow-hidden"
      role="region"
      aria-label="Panel de resultados"
    >
      <div className="flex items-center gap-1 px-4 h-9 border-b border-border bg-muted/20 shrink-0">
        <Button
          variant={view === "results" ? "secondary" : "ghost"}
          size="xs"
          onClick={() => setView("results")}
          aria-pressed={view === "results"}
        >
          <Table2 className="size-3.5" />
          Resultados
        </Button>
        <Button
          variant={view === "graph" ? "secondary" : "ghost"}
          size="xs"
          onClick={() => setView("graph")}
          aria-pressed={view === "graph"}
        >
          <GitBranch className="size-3.5" />
          Grafo del esquema
        </Button>
      </div>

      {view === "graph" ? (
        <>
          {status === "success" && result && (
            <StepPipeline
              pipeline={pipeline}
              onStart={handleStartPipeline}
              onNext={handleNextPipeline}
              onReset={handleResetPipeline}
              tables={tables}
            />
          )}
          <QueryVisualizer
            pipeline={pipeline}
            tables={tables}
          />
        </>
      ) : status === "idle" ? (
        <EmptyState onExecute={onExecute} />
      ) : status === "loading" ? (
        <LoadingState />
      ) : status === "error" && error ? (
        <ErrorState message={error} />
      ) : status === "success" && result ? (
        <SuccessState result={result} />
      ) : (
        <EmptyState onExecute={onExecute} />
      )}
    </Card>
  )
}
