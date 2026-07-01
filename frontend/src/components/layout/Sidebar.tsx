import { useState, type DragEvent } from "react"
import type { HistoryEntry } from "../../hooks/useQueryHistory"
import { defaultSchema } from "../../schema"
import { ScrollArea } from "../ui/scroll-area"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import {
  Database,
  ChevronRight,
  ChevronDown,
  Table2,
  Columns3,
  Clock,
  Trash2,
  Play,
} from "lucide-react"

function SchemaTable({ table, onSelectTable, onDragTable }: {
  table: (typeof defaultSchema)[number]
  onSelectTable: (name: string) => void
  onDragTable: (name: string) => void
}) {
  const [open, setOpen] = useState(false)

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", table.name)
    e.dataTransfer.effectAllowed = "copy"
    onDragTable(table.name)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="cursor-grab active:cursor-grabbing"
    >
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 text-sm font-normal group py-2"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`${open ? "Ocultar" : "Mostrar"} columnas de ${table.name}`}
      >
        {open ? (
          <ChevronDown className="size-3.5 text-accent" />
        ) : (
          <ChevronRight className="size-3.5 text-muted-foreground" />
        )}
        <Table2 className="size-4 text-accent" />
        <span>{table.name}</span>
        <Badge variant="sharp" className="ml-auto">
          {table.columns.length}
        </Badge>
        <button
          onClick={(e) => { e.stopPropagation(); onSelectTable(table.name) }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-accent hover:text-accent/80 cursor-pointer p-1"
          title={`Ver datos de ${table.name}`}
          aria-label={`Ver datos de ${table.name}`}
        >
          <Play className="size-3" />
        </button>
      </Button>
      {open && (
        <div className="ml-6 border-l border-border pl-3 py-1 space-y-0.5">
          {table.columns.map((col) => (
            <div
              key={col.name}
              className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Columns3 className="size-3 shrink-0" />
              <span className="font-mono">{col.name}</span>
              <span className="ml-auto text-[10px] text-muted-foreground/60">
                {col.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface SidebarProps {
  onSelectTable: (tableName: string) => void
  history: HistoryEntry[]
  onSelectHistory: (query: string) => void
  onClearHistory: () => void
  onDragTable?: (tableName: string) => void
}

export function Sidebar({ onSelectTable, history, onSelectHistory, onClearHistory, onDragTable }: SidebarProps) {
  const [tab, setTab] = useState<"schema" | "history">("schema")

  return (
    <aside
      className="w-64 border-r border-border bg-sidebar shrink-0 flex flex-col"
      aria-label="Navegador del esquema de base de datos"
    >
      <div className="flex border-b border-border">
        <button
          onClick={() => setTab("schema")}
          className={`flex-1 flex items-center justify-center gap-1.5 h-10 text-xs font-medium transition-colors ${
            tab === "schema" ? "text-accent border-b-2 border-accent" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Database className="size-3.5" />
          Esquema
        </button>
        <button
          onClick={() => setTab("history")}
          className={`flex-1 flex items-center justify-center gap-1.5 h-10 text-xs font-medium transition-colors ${
            tab === "history" ? "text-accent border-b-2 border-accent" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="size-3.5" />
          Historial
          {history.length > 0 && (
            <Badge variant="sharp" className="ml-1">
              {history.length}
            </Badge>
          )}
        </button>
      </div>

      {tab === "schema" ? (
        <ScrollArea className="flex-1 p-2">
          <nav role="tree" aria-label="Tablas">
            {defaultSchema.map((table) => (
              <SchemaTable
                key={table.name}
                table={table}
                onSelectTable={onSelectTable}
                onDragTable={onDragTable ?? (() => {})}
              />
            ))}
          </nav>
        </ScrollArea>
      ) : (
        <ScrollArea className="flex-1 p-2">
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Sin consultas aún</p>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[10px] text-muted-foreground">Últimas {history.length}</span>
                <Button variant="ghost" size="xs" onClick={onClearHistory} aria-label="Limpiar historial">
                  <Trash2 className="size-3" />
                </Button>
              </div>
              {history.map((entry) => (
                <button
                  key={entry.timestamp}
                  onClick={() => onSelectHistory(entry.query)}
                  className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-muted/50 transition-colors group"
                >
                  <div className="font-mono text-foreground/90 truncate">
                    {entry.query.length > 40 ? entry.query.slice(0, 40) + "..." : entry.query}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 flex gap-2">
                    <span>{entry.dialect === "SQL" ? entry.sqlDialect : "GraphQL"}</span>
                    <span>{new Date(entry.timestamp).toLocaleString("es-AR")}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      )}
    </aside>
  )
}
