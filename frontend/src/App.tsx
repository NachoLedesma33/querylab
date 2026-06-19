import { Sidebar } from "@/components/layout/Sidebar"
import { QueryEditor } from "@/components/layout/QueryEditor"
import { ResultCanvas } from "@/components/layout/ResultCanvas"
import { useQueryLab } from "@/hooks/useQueryLab"
import { Button } from "@/components/ui/button"
import { Terminal } from "lucide-react"

function App() {
  const { query, dialect, status, result, error, setQuery, setDialect, execute } = useQueryLab()

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <header className="h-12 border-b border-border flex items-center px-4 gap-2 bg-header shrink-0" role="banner">
        <Terminal className="size-5 text-indigo-400" />
        <span className="text-sm font-bold tracking-tight">QueryLab</span>
        <div className="ml-4 flex items-center gap-1">
          {(["SQL", "GraphQL"] as const).map((d) => (
            <Button
              key={d}
              variant={dialect === d ? "secondary" : "ghost"}
              size="xs"
              onClick={() => setDialect(d)}
              aria-pressed={dialect === d}
            >
              {d}
            </Button>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 ml-auto">
          {dialect} Playground
        </span>
      </header>

      <div className="flex flex-1 min-h-0">
        <Sidebar />

        <main className="flex-1 flex flex-col min-w-0">
          <div className="h-1/2 min-h-[120px]">
            <QueryEditor
              value={query}
              onChange={setQuery}
              onExecute={execute}
              loading={status === "loading"}
            />
          </div>

          <div className="flex-1 min-h-[120px]">
            <ResultCanvas
              status={status}
              result={result}
              error={error}
              onExecute={execute}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
