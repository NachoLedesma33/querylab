import { useState, useCallback, useMemo, useRef } from "react"
import * as XLSX from "xlsx"
import { Card } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "../ui/alert"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { Badge } from "../ui/badge"
import { QueryVisualizer } from "../flow/QueryVisualizer"
import { StepPipeline } from "../flow/StepPipeline"
import { ColumnStats } from "./ColumnStats"
import type { QueryResponse } from "../../types"
import type { PipelineStep, PipelineState } from "../flow/pipeline-types"
import {
  Brain, AlertCircle, Play, Table2, Timer, ArrowRight, GitBranch,
  FileJson, FileText, FileSpreadsheet, ChevronLeft, ChevronRight, Search,
  ArrowUpDown, ArrowUp, ArrowDown, File as FileIcon, Download,
} from "lucide-react"

interface ResultCanvasProps {
  status: "idle" | "loading" | "error" | "success"
  result: QueryResponse | null
  results: QueryResponse[]
  currentResultIndex: number
  error: string | null
  onExecute: () => void
  onSelectResult: (index: number) => void
}

const stepOrder: PipelineStep[] = ["scan", "join", "filter"]

function download(filename: string, content: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function getColumns(result: QueryResponse) {
  return result.columns.length > 0
    ? result.columns
    : result.result.length > 0
      ? Object.keys(result.result[0])
      : []
}

function getRowValue(row: Record<string, unknown>, column: string) {
  if (Object.prototype.hasOwnProperty.call(row, column)) {
    return row[column]
  }
  const actualKey = Object.keys(row).find((key) => key.toLowerCase() === column.toLowerCase())
  return actualKey ? row[actualKey] : null
}

function exportCsv(result: QueryResponse) {
  const columns = getColumns(result)
  const header = columns.join(",")
  const rows = result.result.map((r) =>
    columns.map((c) => `"${String(getRowValue(r, c) ?? "").replace(/"/g, '""')}"`).join(",")
  )
  download("resultados.csv", [header, ...rows].join("\n"))
}

function exportJson(result: QueryResponse) {
  download("resultados.json", JSON.stringify(result.result, null, 2))
}

function exportMarkdown(result: QueryResponse) {
  const columns = getColumns(result)
  const header = `| ${columns.join(" | ")} |`
  const sep = `| ${columns.map(() => "---").join(" | ")} |`
  const rows = result.result.map((r) => `| ${columns.map((c) => String(getRowValue(r, c) ?? "")).join(" | ")} |`)
  download("resultados.md", [header, sep, ...rows].join("\n"))
}

function exportXlsx(result: QueryResponse) {
  const columns = getColumns(result)
  const data = [columns, ...result.result.map((r) => columns.map((c) => getRowValue(r, c) ?? ""))]
  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Resultados")
  XLSX.writeFile(wb, "resultados.xlsx")
}

function exportYaml(result: QueryResponse) {
  const columns = getColumns(result)
  const yaml = result.result.map((r) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((c) => { obj[c] = getRowValue(r, c) })
    return obj
  })
  const lines = yaml.map((item) =>
    Object.entries(item)
      .map(([k, v]) => `  ${k}: ${v === null ? "null" : typeof v === "string" ? `"${v}"` : String(v)}`)
      .join("\n")
  )
  download("resultados.yaml", `resultados:\n${lines.join("\n---\n")}`)
}

function exportXml(result: QueryResponse) {
  const columns = getColumns(result)
  const rows = result.result.map((r) => {
    const cells = columns.map((c) => `    <${c}>${String(getRowValue(r, c) ?? "")}</${c}>`).join("\n")
    return `  <fila>\n${cells}\n  </fila>`
  })
  download("resultados.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<resultados>\n${rows.join("\n")}\n</resultados>`)
}

function EmptyState({ onExecute }: { onExecute: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
      <div className="size-16 bg-muted flex items-center justify-center border border-border">
        <Brain className="size-8 text-accent" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground">Listo para consultar</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Escribí una consulta SQL en el editor de arriba y presioná{" "}
          <kbd className="px-1.5 py-0.5 bg-muted text-xs font-mono border border-border">Ejecutar</kbd>{" "}
          para ver los resultados aquí.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          También podés separar varias consultas con <kbd className="px-1 bg-muted text-[10px] font-mono border border-border">;</kbd>
        </p>
      </div>
      <Button variant="sharp-accent" size="sm" onClick={onExecute} aria-label="Ejecutar consulta">
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
  const isSecurity = message.includes("⚠ Seguridad:") || message.toLowerCase().includes("forbidden") || message.toLowerCase().includes("bloqueada")
  const isTimeout = message.toLowerCase().includes("timeout") || message.toLowerCase().includes("tiempo")
  const isTooMany = message.toLowerCase().includes("too many requests") || message.toLowerCase().includes("demasiadas")
  const isGrammar = message.toLowerCase().includes("bad sql grammar") || message.toLowerCase().includes("syntax error")
  const isReset = message.startsWith("Reset failed") || message.startsWith("Error al restaurar")

  let suggestion = ""
  if (isSecurity) suggestion = "Probá con una consulta SELECT simple como: SELECT * FROM movies LIMIT 5"
  else if (isTimeout) suggestion = "Agregá una cláusula LIMIT para reducir la cantidad de resultados."
  else if (isTooMany) suggestion = "Esperá un momento y volvé a intentar."
  else if (isReset) suggestion = "Ocurrió un error al restaurar la base de datos. Intentá de nuevo en un momento."
  else if (isGrammar) suggestion = "Revisá la sintaxis SQL. Probá con: SELECT * FROM movies LIMIT 10"

  return (
    <div className="p-6">
      <Alert variant={isSecurity ? "default" : "destructive"}>
        <AlertCircle className={isSecurity ? "size-4 text-orange-400" : "size-4"} />
        <AlertTitle>
          {isSecurity ? "⚠ Consulta bloqueada" : isTimeout ? "⏱ Tiempo agotado" : isTooMany ? "⏳ Demasiadas solicitudes" : "Error"}
        </AlertTitle>
        <AlertDescription className="font-mono text-sm mt-1">{message}</AlertDescription>
        {suggestion && (
          <p className="text-xs text-muted-foreground mt-2 border-t border-border/50 pt-2">
            💡 {suggestion}
          </p>
        )}
      </Alert>
    </div>
  )
}

type SortDir = "asc" | "desc" | null

function PaginatedTable({ result: allRows, columns, totalRows }: {
  result: Record<string, unknown>[]
  columns: string[]
  totalRows: number
}) {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(100)
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)
  const [filterText, setFilterText] = useState("")
  const [statsCol, setStatsCol] = useState<string | null>(null)
  const headerRefs = useRef<Record<string, HTMLElement | null>>({})

  const filtered = useMemo(() => {
    if (!filterText.trim()) return allRows
    const f = filterText.toLowerCase()
    return allRows.filter((row) =>
      columns.some((c) => String(getRowValue(row, c) ?? "").toLowerCase().includes(f))
    )
  }, [allRows, filterText, columns])

  const sorted = useMemo(() => {
    if (!sortCol || !sortDir) return filtered
    return [...filtered].sort((a, b) => {
      const va = getRowValue(a, sortCol)
      const vb = getRowValue(b, sortCol)
      if (va == null) return 1
      if (vb == null) return -1
      const cmp = typeof va === "number" ? va - (vb as number) : String(va).localeCompare(String(vb))
      return sortDir === "desc" ? -cmp : cmp
    })
  }, [filtered, sortCol, sortDir])

  const totalPages = Math.ceil(sorted.length / pageSize)
  const pageRows = useMemo(() => sorted.slice(page * pageSize, (page + 1) * pageSize), [sorted, page, pageSize])
  const hasPagination = sorted.length > pageSize

  const handleSort = (col: string) => {
    if (sortCol === col) {
      if (sortDir === "asc") { setSortDir("desc"); setPage(0) }
      else if (sortDir === "desc") { setSortCol(null); setSortDir(null); setPage(0) }
      else { setSortDir("asc"); setPage(0) }
    } else { setSortCol(col); setSortDir("asc"); setPage(0) }
  }

  const changePageSize = (size: number) => {
    setPageSize(size)
    setPage(0)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center gap-2 px-3 h-8 border-b border-border/50 bg-muted/10 shrink-0">
        <Search className="size-3 text-muted-foreground shrink-0" />
        <input
          value={filterText}
          onChange={(e) => { setFilterText(e.target.value); setPage(0) }}
          placeholder="Filtrar resultados..."
          className="flex-1 h-full bg-transparent text-[11px] text-foreground placeholder:text-muted-foreground/40 outline-none border-0"
        />
        <span className="text-[10px] text-muted-foreground/60 shrink-0">
          {sorted.length} de {totalRows} filas
        </span>
      </div>
      {statsCol && <ColumnStats column={statsCol} rows={sorted} onClose={() => setStatsCol(null)} anchorEl={headerRefs.current[statsCol]} />}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 min-h-full">
          {pageRows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {filterText ? `Sin resultados para "${filterText}"` : "Consulta ejecutada correctamente. No se devolvieron filas."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse" role="table" aria-label="Resultados de la consulta">
                  <thead>
                    <tr className="border-b border-border">
                      {columns.map((col) => {
                        const active = sortCol === col
                        const dir = active ? sortDir : null
                        return (
                          <th key={col} className="text-left px-2 py-1 text-[10px] font-semibold text-accent uppercase tracking-wider" scope="col">
                            <div className="inline-flex items-center gap-1">
                              <button
                                ref={(el) => { headerRefs.current[col] = el }}
                                onClick={() => setStatsCol(statsCol === col ? null : col)}
                                className="hover:text-accent/80 transition-colors cursor-pointer bg-transparent border-0 p-0 font-inherit underline decoration-dotted underline-offset-2"
                                title="Ver estadísticas de columna"
                              >
                                {col}
                              </button>
                              <button onClick={() => handleSort(col)} className="hover:text-accent/80 transition-colors cursor-pointer bg-transparent border-0 p-0">
                                {dir === "asc" ? <ArrowUp className="size-2.5" /> : dir === "desc" ? <ArrowDown className="size-2.5" /> : <ArrowUpDown className="size-2.5 opacity-30" />}
                              </button>
                            </div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                <tbody>
                  {pageRows.map((row, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      {columns.map((col) => (
                        <td key={col} className="px-2 py-0.5 text-xs font-mono text-foreground/90">
                          {String(getRowValue(row, col) ?? "")}
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
      {(hasPagination || sorted.length > 0) && (
        <div className="flex items-center justify-between px-3 h-8 border-t border-border shrink-0 bg-muted/20">
          <div className="flex items-center gap-1">
            {[50, 100, 500, -1].map((s) => (
              <button
                key={s}
                onClick={() => changePageSize(s === -1 ? sorted.length : s)}
                className={`text-[10px] px-1.5 py-0.5 border transition-colors ${
                  pageSize === s || (s === -1 && pageSize === sorted.length)
                    ? "border-accent text-accent"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === -1 ? "Todo" : s}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">
            Página {page + 1} de {totalPages} ({sorted.length} filas)
          </span>
          <div className="flex items-center gap-0.5">
            <Button variant="sharp" size="icon-xs" disabled={page === 0} onClick={() => setPage((p) => p - 1)} aria-label="Página anterior">
              <ChevronLeft className="size-3" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
              const start = Math.max(0, Math.min(page - 4, totalPages - 10))
              const p = start + i
              if (p >= totalPages) return null
              return (
                <Button key={p} variant={p === page ? "sharp-accent" : "sharp"} size="icon-xs" className="text-[10px] min-w-[20px]" onClick={() => setPage(p)}>
                  {p + 1}
                </Button>
              )
            })}
            {totalPages > 10 && <span className="text-[10px] text-muted-foreground px-0.5">...</span>}
            <Button variant="sharp" size="icon-xs" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} aria-label="Página siguiente">
              <ChevronRight className="size-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function SuccessState({ result, results, currentResultIndex, onSelectResult }: {
  result: QueryResponse
  results: QueryResponse[]
  currentResultIndex: number
  onSelectResult: (index: number) => void
}) {
  const columns = getColumns(result)

  return (
    <div className="flex flex-col flex-1 min-h-0" role="region" aria-label="Resultados de la consulta">
      <div className="flex items-center gap-3 px-4 h-10 border-b border-border shrink-0">
        {results.length > 1 && (
          <div className="flex items-center gap-0.5 mr-2 border-r border-border pr-2">
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => onSelectResult(i)}
                className={`text-[11px] px-2 py-0.5 transition-colors ${
                  i === currentResultIndex
                    ? "bg-accent/20 text-accent font-medium border-b border-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                #{i + 1} <span className="ml-1 text-[10px] text-muted-foreground">({r.rows})</span>
              </button>
            ))}
          </div>
        )}
        <Badge variant="sharp" className="gap-1">
          <Table2 className="size-3" />
          {result.rows} fila{result.rows !== 1 ? "s" : ""}
        </Badge>
        <Badge variant="sharp" className="gap-1">
          <Timer className="size-3" />
          {result.executionTimeMs}ms
        </Badge>
        {result.tables.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
            <span>Tablas:</span>
            {result.tables.map((t, i) => (
              <span key={t}>
                <code className="text-accent">{t}</code>
                {i < result.tables.length - 1 && <ArrowRight className="size-3 inline mx-0.5" />}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-0.5">
          <Button variant="sharp" size="icon-xs" onClick={() => exportXlsx(result)} aria-label="Exportar Excel" title="Exportar Excel">
            <FileSpreadsheet className="size-3.5" />
          </Button>
          <Button variant="sharp" size="icon-xs" onClick={() => exportCsv(result)} aria-label="Exportar CSV" title="Exportar CSV">
            <FileText className="size-3.5" />
          </Button>
          <Button variant="sharp" size="icon-xs" onClick={() => exportJson(result)} aria-label="Exportar JSON" title="Exportar JSON">
            <FileJson className="size-3.5" />
          </Button>
          <Button variant="sharp" size="icon-xs" onClick={() => exportYaml(result)} aria-label="Exportar YAML" title="Exportar YAML">
            <Download className="size-3.5" />
          </Button>
          <Button variant="sharp" size="icon-xs" onClick={() => exportXml(result)} aria-label="Exportar XML" title="Exportar XML">
            <FileIcon className="size-3.5" />
          </Button>
          <Button variant="sharp" size="icon-xs" onClick={() => exportMarkdown(result)} aria-label="Exportar Markdown" title="Exportar Markdown">
            <FileText className="size-3.5" />
          </Button>
        </div>
      </div>
      <PaginatedTable result={result.result} columns={columns} totalRows={result.rows} />
    </div>
  )
}

export function ResultCanvas({ status, result, results, currentResultIndex, error, onExecute, onSelectResult }: ResultCanvasProps) {
  const [view, setView] = useState<"results" | "graph">("results")
  const [pipeline, setPipeline] = useState<PipelineState>({
    active: false, currentStep: null, completedSteps: [],
  })
  const tables = result?.tables ?? []

  const handleStartPipeline = useCallback(() => {
    setPipeline({ active: true, currentStep: "scan", completedSteps: [] })
  }, [])

  const handleNextPipeline = useCallback(() => {
    setPipeline((prev) => {
      if (!prev.currentStep) return prev
      const idx = stepOrder.indexOf(prev.currentStep)
      const nextStep = idx < stepOrder.length - 1 ? stepOrder[idx + 1] : null
      return { active: nextStep !== null, currentStep: nextStep, completedSteps: [...prev.completedSteps, prev.currentStep] }
    })
  }, [])

  const handleResetPipeline = useCallback(() => {
    setPipeline({ active: false, currentStep: null, completedSteps: [] })
  }, [])

  return (
    <Card className="flex flex-col flex-1 min-h-0 h-full rounded-none border-0 border-t border-border bg-canvas overflow-hidden" role="region" aria-label="Panel de resultados">
      <div className="flex items-center gap-1 px-4 h-9 border-b border-border bg-muted/20 shrink-0">
        <Button variant={view === "results" ? "sharp-accent" : "sharp"} size="xs" onClick={() => setView("results")} aria-pressed={view === "results"}>
          <Table2 className="size-3.5" />
          Resultados
        </Button>
        <Button variant={view === "graph" ? "sharp-accent" : "sharp"} size="xs" onClick={() => setView("graph")} aria-pressed={view === "graph"}>
          <GitBranch className="size-3.5" />
          SCHEMA GRAPH
        </Button>
      </div>

      {view === "graph" ? (
        <div className="flex flex-col flex-1 min-h-0 h-full">
          {status === "success" && result && (
            <StepPipeline pipeline={pipeline} onStart={handleStartPipeline} onNext={handleNextPipeline} onReset={handleResetPipeline} tables={tables} />
          )}
          <div className="relative flex-1 min-h-0 h-full w-full min-h-[360px]">
            <QueryVisualizer pipeline={pipeline} tables={tables} />
          </div>
        </div>
      ) : status === "idle" ? (
        <EmptyState onExecute={onExecute} />
      ) : status === "loading" ? (
        <LoadingState />
      ) : status === "error" && error ? (
        <ErrorState message={error} />
      ) : status === "success" && result ? (
        <SuccessState result={result} results={results} currentResultIndex={currentResultIndex} onSelectResult={onSelectResult} />
      ) : (
        <EmptyState onExecute={onExecute} />
      )}
    </Card>
  )
}