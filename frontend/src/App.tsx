import { useState, useCallback } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { QueryEditor } from "@/components/layout/QueryEditor"
import { ResultCanvas } from "@/components/layout/ResultCanvas"
import type { QueryResponse } from "@/types"
import { Terminal } from "lucide-react"

type Status = "idle" | "loading" | "error" | "success"

function App() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [result, setResult] = useState<QueryResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExecute = useCallback(async () => {
    if (!query.trim()) return

    setStatus("loading")
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/v1/queries/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, dialect: "SQL" }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? `Server error: ${res.status}`)
      }

      const data: QueryResponse = await res.json()
      setResult(data)
      setStatus("success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setStatus("error")
    }
  }, [query])

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <header className="h-12 border-b border-border flex items-center px-4 gap-2 bg-header shrink-0" role="banner">
        <Terminal className="size-5 text-indigo-400" />
        <span className="text-sm font-bold tracking-tight">QueryLab</span>
        <span className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 ml-auto">
          SQL Playground
        </span>
      </header>

      <div className="flex flex-1 min-h-0">
        <Sidebar />

        <main className="flex-1 flex flex-col min-w-0">
          <div className="h-1/2 min-h-[120px]">
            <QueryEditor
              value={query}
              onChange={setQuery}
              onExecute={handleExecute}
              loading={status === "loading"}
            />
          </div>

          <div className="flex-1 min-h-[120px]">
            <ResultCanvas
              status={status}
              result={result}
              error={error}
              onExecute={handleExecute}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
