import { lazy, Suspense, useState, useCallback, useEffect } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { ResultCanvas } from "@/components/layout/ResultCanvas"
import { ShortcutsDialog } from "@/components/layout/ShortcutsDialog"
import { QuickStartDialog } from "@/components/layout/QuickStartDialog"
import { QueryTemplates } from "@/components/layout/QueryTemplates"
import { SaveQueryDialog } from "@/components/layout/SaveQueryDialog"
import { SkipLink } from "@/components/layout/SkipLink"
import { useQueryLab } from "@/hooks/useQueryLab"
import { useTheme } from "@/hooks/useTheme"
import { useSound } from "@/hooks/useSound"
import { useQueryFavorites } from "@/hooks/useQueryFavorites"
import { useQuerySaves } from "@/hooks/useQuerySaves"
import { Button } from "@/components/ui/button"
import { Terminal, RotateCcw, Sun, Moon, Keyboard, Maximize2, Minimize2, Volume2, VolumeX, FileCode, Save } from "lucide-react"

const QueryEditor = lazy(() => import("@/components/layout/QueryEditor"))

const SQL_DIALECTS = ["H2", "MySQL", "PostgreSQL", "SQLServer", "Oracle"] as const

function EditorSkeleton() {
  return (
    <div className="flex flex-col h-full bg-editor" role="status" aria-label="Cargando editor">
      <div className="h-10 border-b border-border bg-muted/30 shrink-0" />
      <div className="flex-1 p-4 space-y-2">
        <div className="h-4 w-3/4 rounded bg-muted/50 animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-muted/50 animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-muted/50 animate-pulse" />
      </div>
    </div>
  )
}

function App() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [savesOpen, setSavesOpen] = useState(false)
  const [presentation, setPresentation] = useState(false)
  const [draggedTable, setDraggedTable] = useState<string | null>(null)
  const [quickStartOpen, setQuickStartOpen] = useState(false)

  const {
    query, dialect, sqlDialect, status, result, error, results, currentResultIndex,
    history, clearHistory,
    setQuery, setDialect, setSqlDialect, setAndExecute, execute, selectResult, resetDatabase,
  } = useQueryLab()
  const { theme, toggleTheme } = useTheme()
  const { soundEnabled, toggleSound, playSuccess } = useSound()
  const { favorites, addFavorite, removeFavorite, isFavorite } = useQueryFavorites()
  const { saved, saveQuery, deleteSaved } = useQuerySaves()

  useEffect(() => {
    const hasHistory = history.length > 0
    const onboardingProgress = localStorage.getItem('querylab-onboarding')
    const shouldShowQuickStart = !hasHistory && onboardingProgress === null
    if (shouldShowQuickStart && !quickStartOpen) {
      setQuickStartOpen(true)
    }
  }, [history, quickStartOpen])

  useEffect(() => {
    try {
      const saved = localStorage.getItem("querylab-session")
      if (saved) {
        const { query: q, dialect: d, sqlDialect: sd } = JSON.parse(saved)
        if (q) setQuery(q)
        if (d) setDialect(d)
        if (sd) setSqlDialect(sd)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("querylab-session", JSON.stringify({ query, dialect, sqlDialect }))
    } catch { /* ignore */ }
  }, [query, dialect, sqlDialect])

  useEffect(() => {
    if (status === "success" && result) {
      localStorage.setItem('querylab-last-success', new Date().toISOString())
    }
  }, [status, result])

  const handleExecute = useCallback(async () => {
    await execute()
    const s = status
    if (s === "success" || s === "error") {
      if (s === "success") playSuccess()
    }
  }, [execute, status, playSuccess])

  const handleToggleFavorite = useCallback((entry: { query: string; dialect: string; sqlDialect: string }) => {
    if (isFavorite(entry.query)) {
      removeFavorite(entry.query)
    } else {
      addFavorite(entry.query, entry.dialect, entry.sqlDialect)
    }
  }, [isFavorite, removeFavorite, addFavorite])

  const handleInsertTemplate = useCallback((templateQuery: string) => {
    setQuery(templateQuery)
    setTemplatesOpen(false)
  }, [setQuery])

  const handleSaveQuery = useCallback((name: string, description?: string) => {
    saveQuery(name, query, dialect, sqlDialect, description)
  }, [query, dialect, sqlDialect, saveQuery])

  const handleLoadQuery = useCallback((q: string) => {
    setQuery(q)
    setSavesOpen(false)
  }, [setQuery])

  return (
    <div className="neoclassic h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <SkipLink />
      {!presentation && (
        <header className="h-12 border-b border-border flex items-center px-4 gap-2 bg-header shrink-0" role="banner">
          <Terminal className="size-5 text-accent" />
          <span className="text-sm font-bold tracking-tight">QueryLab</span>
          <div className="ml-4 flex items-center gap-1">
            {(["SQL", "GraphQL"] as const).map((d) => (
              <Button key={d} variant={dialect === d ? "sharp-accent" : "sharp"} size="xs" onClick={() => setDialect(d)} aria-pressed={dialect === d}>
                {d}
              </Button>
            ))}
          </div>
          {dialect === "SQL" && (
            <div className="flex items-center gap-1 ml-1 border-l border-border pl-2">
              {SQL_DIALECTS.map((d) => (
                <Button key={d} variant={sqlDialect === d ? "sharp-accent" : "sharp"} size="xs" onClick={() => setSqlDialect(d)} aria-pressed={sqlDialect === d} className="text-[11px] px-1.5">
                  {d}
                </Button>
              ))}
            </div>
          )}
          <Button variant="sharp" size="icon-xs" onClick={() => setTemplatesOpen(true)} aria-label="Templates de consultas" title="Templates de consultas" className="ml-2">
            <FileCode className="size-3.5" />
          </Button>
          <Button variant="sharp" size="icon-xs" onClick={() => setSavesOpen(true)} aria-label="Consultas guardadas" title="Consultas guardadas">
            <Save className="size-3.5" />
          </Button>
          <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 ml-auto uppercase tracking-widest">
            {dialect === "SQL" ? `Entorno ${sqlDialect}` : "Entorno GraphQL"}
          </span>
          <Button variant="sharp" size="icon-xs" onClick={toggleSound} aria-label={soundEnabled() ? "Desactivar sonido" : "Activar sonido"} title={soundEnabled() ? "Desactivar sonido" : "Activar sonido"}>
            {soundEnabled() ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
          </Button>
          <Button variant="sharp" size="icon-xs" onClick={toggleTheme} aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"} title={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}>
            {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
          </Button>
          <Button variant="sharp" size="icon-xs" onClick={() => setShortcutsOpen(true)} aria-label="Atajos de teclado" title="Atajos de teclado">
            <Keyboard className="size-3.5" />
          </Button>
          <Button variant="sharp" size="icon-xs" onClick={() => setPresentation(true)} aria-label="Modo presentación" title="Modo presentación">
            <Maximize2 className="size-3.5" />
          </Button>
          <Button variant="sharp" size="icon-xs" onClick={resetDatabase} aria-label="Restaurar base de datos" title="Restaurar la base de datos a su estado original">
            <RotateCcw className="size-3.5" />
          </Button>
        </header>
      )}

      {presentation && (
        <div className="absolute top-2 right-2 z-50">
          <Button variant="sharp" size="icon-xs" onClick={() => setPresentation(false)} aria-label="Salir de modo presentación" title="Salir de modo presentación" className="bg-card/80 backdrop-blur">
            <Minimize2 className="size-3.5" />
          </Button>
        </div>
      )}

      <main className="flex flex-1 min-h-0" id="main-content" role="main">
        {!presentation && (
          <Sidebar
            onSelectTable={(tableName) => setAndExecute(`SELECT * FROM ${tableName}`).catch(() => {})}
            history={history}
            onSelectHistory={(query) => setAndExecute(query).catch(() => {})}
            onClearHistory={clearHistory}
            onDragTable={(tableName) => setDraggedTable(tableName)}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={isFavorite}
          />
        )}

        <main className="flex-1 flex flex-col min-w-0">
          <div className="h-1/2 min-h-[120px]">
            <Suspense fallback={<EditorSkeleton />}>
              <QueryEditor
                value={query}
                onChange={setQuery}
                onExecute={handleExecute}
                loading={status === "loading"}
                theme={theme}
                draggedTable={draggedTable}
                onClearDrag={() => setDraggedTable(null)}
              />
            </Suspense>
          </div>

          <div className="flex-1 min-h-[120px]">
            <ResultCanvas
              status={status}
              result={result}
              results={results}
              currentResultIndex={currentResultIndex}
              error={error}
              onExecute={execute}
              onSelectResult={selectResult}
            />
          </div>
        </main>
      </main>

      <QueryTemplates open={templatesOpen} onClose={() => setTemplatesOpen(false)} onInsert={handleInsertTemplate} />
      <SaveQueryDialog
        open={savesOpen}
        onClose={() => setSavesOpen(false)}
        saved={saved}
        onSave={handleSaveQuery}
        onLoad={handleLoadQuery}
        onDelete={deleteSaved}
        currentQuery={query}
      />
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <Suspense fallback={null}>
        <QuickStartDialog open={quickStartOpen} onClose={() => setQuickStartOpen(false)} />
      </Suspense>
    </div>
  )
}

export default App