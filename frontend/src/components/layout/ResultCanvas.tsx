import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { QueryResponse } from "@/types"
import {
  Brain,
  AlertCircle,
  Play,
  Table2,
  Timer,
  ArrowRight,
} from "lucide-react"

interface ResultCanvasProps {
  status: "idle" | "loading" | "error" | "success"
  result: QueryResponse | null
  error: string | null
  onExecute: () => void
}

function EmptyState({ onExecute }: { onExecute: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
      <div className="size-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center ring-1 ring-indigo-500/20">
        <Brain className="size-8 text-indigo-400" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground">
          Ready to query
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Write a SQL query in the editor above and click{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">
            Run
          </kbd>{" "}
          to see results here.
        </p>
      </div>
      <Button size="sm" onClick={onExecute} aria-label="Run query">
        <Play className="size-3.5" />
        Run query
      </Button>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="p-6 space-y-4" role="status" aria-label="Loading query results">
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
  return (
    <div className="p-6">
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>SQL Error</AlertTitle>
        <AlertDescription className="font-mono text-sm mt-1">
          {message}
        </AlertDescription>
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
    <div className="flex flex-col h-full" role="region" aria-label="Query results">
      <div className="flex items-center gap-3 px-4 h-10 border-b border-border shrink-0">
        <Badge variant="secondary" className="gap-1">
          <Table2 className="size-3" />
          {result.rows} row{result.rows !== 1 ? "s" : ""}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Timer className="size-3" />
          {result.executionTimeMs}ms
        </Badge>
        {result.tables.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
            <span>Tables:</span>
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
              Query executed successfully. No rows returned.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table
                className="w-full text-sm border-collapse"
                role="table"
                aria-label="Query result set"
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
  return (
    <Card
      className="flex-1 min-h-0 rounded-none border-0 border-t border-border bg-canvas overflow-hidden"
      role="region"
      aria-label="Query result panel"
    >
      {status === "idle" && <EmptyState onExecute={onExecute} />}
      {status === "loading" && <LoadingState />}
      {status === "error" && error && <ErrorState message={error} />}
      {status === "success" && result && <SuccessState result={result} />}
    </Card>
  )
}
