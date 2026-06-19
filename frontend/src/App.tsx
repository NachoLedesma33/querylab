import { Sidebar } from "@/components/layout/Sidebar"
import { QueryEditor } from "@/components/layout/QueryEditor"
import { ResultCanvas } from "@/components/layout/ResultCanvas"
import { useQueryLab } from "@/hooks/useQueryLab"
import { Button } from "@/components/ui/button"
import { Terminal, RotateCcw } from "lucide-react"

const SQL_DIALECTS = ["H2", "MySQL", "PostgreSQL", "SQLServer", "Oracle"] as const

function App() {
  const { query, dialect, sqlDialect, status, result, error, setQuery, setDialect, setSqlDialect, execute, resetDatabase } = useQueryLab()

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
        {dialect === "SQL" && (
          <div className="flex items-center gap-1 ml-1 border-l border-border pl-2">
            {SQL_DIALECTS.map((d) => (
              <Button
                key={d}
                variant={sqlDialect === d ? "secondary" : "ghost"}
                size="xs"
                onClick={() => setSqlDialect(d)}
                aria-pressed={sqlDialect === d}
                className="text-[11px] px-1.5"
              >
                {d}
              </Button>
            ))}
          </div>
        )}
        <span className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 ml-auto">
          {dialect === "SQL" ? `Entorno ${sqlDialect}` : "Entorno GraphQL"}
        </span>
        <Button
          variant="ghost"
          size="xs"
          onClick={resetDatabase}
          aria-label="Restaurar base de datos"
          title="Restaurar la base de datos a su estado original con todos los datos iniciales"
          className="text-muted-foreground hover:text-orange-400"
        >
          <RotateCcw className="size-3.5" />
          Restaurar BD
        </Button>
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
