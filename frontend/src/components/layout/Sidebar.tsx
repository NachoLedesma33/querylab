import { useState, useMemo, type DragEvent } from "react"
import type { HistoryEntry } from "../../hooks/useQueryHistory"
import type { FavoriteEntry } from "../../hooks/useQueryFavorites"
import { defaultSchema } from "../../schema"
import { ScrollArea } from "../ui/scroll-area"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import {
  Database, ChevronRight, ChevronDown, Table2, Clock, Trash2, Play, Search,
  Star, LetterText, Hash, Calendar, ToggleLeft,
} from "lucide-react"

type TypeCategory = "number" | "string" | "date" | "boolean"

const TYPE_ICONS: Record<TypeCategory, typeof Hash> = {
  number: Hash,
  string: LetterText,
  date: Calendar,
  boolean: ToggleLeft,
}

const TYPE_COLORS: Record<TypeCategory, string> = {
  number: "text-blue-400",
  string: "text-green-400",
  date: "text-amber-400",
  boolean: "text-purple-400",
}

function getTypeCategory(type: string): TypeCategory {
  const t = type.toUpperCase()
  if (t.startsWith("INT") || t.startsWith("BIG") || t.startsWith("DEC") || t.startsWith("FLOAT") || t.startsWith("DOUBLE") || t.startsWith("SMALL")) return "number"
  if (t.startsWith("VARCHAR") || t.startsWith("CHAR") || t.startsWith("TEXT") || t.startsWith("CLOB")) return "string"
  if (t.startsWith("DATE") || t.startsWith("TIME") || t.startsWith("TIMESTAMP")) return "date"
  if (t.startsWith("BOOL")) return "boolean"
  return "string"
}

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
    <div draggable onDragStart={handleDragStart} className="cursor-grab active:cursor-grabbing">
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 text-sm font-normal group py-2"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`${open ? "Ocultar" : "Mostrar"} columnas de ${table.name}`}
      >
        {open ? <ChevronDown className="size-3.5 text-accent" /> : <ChevronRight className="size-3.5 text-muted-foreground" />}
        <Table2 className="size-4 text-accent" />
        <span>{table.name}</span>
        <Badge variant="sharp" className="ml-auto">{table.columns.length}</Badge>
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
          {table.columns.map((col) => {
            const cat = getTypeCategory(col.type)
            const Icon = TYPE_ICONS[cat]
            const color = TYPE_COLORS[cat]
            return (
              <div
                key={col.name}
                className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors group/col"
              >
                <Icon className={`size-3 shrink-0 ${color}`} />
                <span className="font-mono text-foreground/80">{col.name}</span>
                <Badge
                  variant="sharp"
                  className={`ml-auto text-[9px] px-1 ${color}`}
                >
                  {col.type}
                </Badge>
              </div>
            )
          })}
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
  favorites: FavoriteEntry[]
  onToggleFavorite: (entry: HistoryEntry) => void
  isFavorite: (query: string) => boolean
}

export function Sidebar({ onSelectTable, history, onSelectHistory, onClearHistory, onDragTable, favorites, onToggleFavorite, isFavorite }: SidebarProps) {
  const [tab, setTab] = useState<"schema" | "history" | "favorites">("schema")
  const [historySearch, setHistorySearch] = useState("")

  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return history
    const s = historySearch.toLowerCase()
    return history.filter((e) => e.query.toLowerCase().includes(s) || e.dialect.toLowerCase().includes(s) || (e.sqlDialect || "").toLowerCase().includes(s))
  }, [history, historySearch])

  return (
    <aside className="w-64 border-r border-border bg-sidebar shrink-0 flex flex-col" aria-label="Navegador del esquema de base de datos">
      <div className="flex border-b border-border">
        {(["schema", "history", "favorites"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-1 h-10 text-xs font-medium transition-colors ${
              tab === t ? "text-accent border-b-2 border-accent" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "schema" && <Database className="size-3.5" />}
            {t === "history" && <Clock className="size-3.5" />}
            {t === "favorites" && <Star className="size-3.5" />}
            {t === "schema" && "Esquema"}
            {t === "history" && "Historial"}
            {t === "favorites" && "Favoritos"}
            {(t === "history" && history.length > 0) && <Badge variant="sharp" className="ml-0.5">{history.length}</Badge>}
            {(t === "favorites" && favorites.length > 0) && <Badge variant="sharp" className="ml-0.5">{favorites.length}</Badge>}
          </button>
        ))}
      </div>

      {tab === "schema" ? (
        <ScrollArea className="flex-1 p-2">
          <nav role="tree" aria-label="Tablas">
            {defaultSchema.map((table) => (
              <SchemaTable key={table.name} table={table} onSelectTable={onSelectTable} onDragTable={onDragTable ?? (() => {})} />
            ))}
          </nav>
        </ScrollArea>
      ) : tab === "history" ? (
        <>
          <div className="p-2 pb-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
              <input
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Buscar en historial..."
                className="w-full h-7 pl-7 pr-2 text-[11px] bg-background border border-border rounded-none text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-accent"
              />
            </div>
          </div>
          <ScrollArea className="flex-1 p-2">
            {filteredHistory.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                {historySearch ? `Sin resultados para "${historySearch}"` : "Sin consultas aún"}
              </p>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[10px] text-muted-foreground">
                    {historySearch ? `${filteredHistory.length} de ${history.length}` : `Últimas ${history.length}`}
                  </span>
                  <Button variant="ghost" size="xs" onClick={onClearHistory} aria-label="Limpiar historial">
                    <Trash2 className="size-3" />
                  </Button>
                </div>
                {filteredHistory.map((entry) => {
                  const fav = isFavorite(entry.query)
                  return (
                    <div key={entry.timestamp} className="group flex items-start gap-1">
                      <button
                        onClick={() => onToggleFavorite(entry)}
                        className={`mt-1.5 p-0.5 transition-colors shrink-0 ${fav ? "text-accent" : "text-muted-foreground/30 hover:text-accent/60 opacity-0 group-hover:opacity-100"}`}
                        title={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
                        aria-label={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
                      >
                        <Star className="size-3" />
                      </button>
                      <button
                        onClick={() => onSelectHistory(entry.query)}
                        className="flex-1 text-left px-2 py-1.5 rounded text-xs hover:bg-muted/50 transition-colors min-w-0"
                      >
                        <div className="font-mono text-foreground/90 truncate">
                          {entry.query.length > 35 ? entry.query.slice(0, 35) + "..." : entry.query}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 flex gap-1.5">
                          {fav && <Star className="size-2.5 text-accent inline" />}
                          <span>{entry.dialect === "SQL" ? entry.sqlDialect : "GraphQL"}</span>
                          <span>{new Date(entry.timestamp).toLocaleString("es-AR")}</span>
                        </div>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </>
      ) : (
        <ScrollArea className="flex-1 p-2">
          {favorites.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              Sin favoritos aún<br />
              <span className="text-[10px]">Hacé clic en la estrella ☆ del historial para agregar</span>
            </p>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[10px] text-muted-foreground">{favorites.length} favorito{favorites.length !== 1 ? "s" : ""}</span>
              </div>
              {favorites.map((entry) => (
                <div key={entry.timestamp} className="group flex items-start gap-1">
                  <button
                    onClick={() => onSelectHistory(entry.query)}
                    className="flex-1 text-left px-2 py-1.5 rounded text-xs hover:bg-muted/50 transition-colors min-w-0"
                  >
                    <div className="font-mono text-foreground/90 truncate">
                      {entry.query.length > 35 ? entry.query.slice(0, 35) + "..." : entry.query}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 flex gap-1.5">
                      <Star className="size-2.5 text-accent inline" />
                      <span>{entry.dialect === "SQL" ? entry.sqlDialect : "GraphQL"}</span>
                      <span>{new Date(entry.timestamp).toLocaleString("es-AR")}</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      )}
    </aside>
  )
}