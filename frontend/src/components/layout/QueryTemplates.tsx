import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { FileCode, GitBranch, Sigma, SortDesc, Filter, Table2, X, Search, Copy, Check } from "lucide-react"

interface Template {
  id: string
  category: string
  icon: typeof FileCode
  title: string
  description: string
  query: string
}

const templates: Template[] = [
  {
    id: "select-all",
    category: "Básicos",
    icon: Table2,
    title: "SELECT * con LIMIT",
    description: "Seleccionar todas las columnas de una tabla",
    query: "SELECT * FROM movies LIMIT 50"
  },
  {
    id: "select-where",
    category: "Básicos",
    icon: Filter,
    title: "SELECT con WHERE",
    description: "Filtrar resultados por condición",
    query: "SELECT * FROM movies WHERE rating > 8.0 ORDER BY rating DESC"
  },
  {
    id: "join-simple",
    category: "JOINs",
    icon: GitBranch,
    title: "INNER JOIN simple",
    description: "Combinar dos tablas relacionadas",
    query: "SELECT u.name, s.plan, s.price\nFROM users u\nJOIN subscriptions s ON u.id = s.user_id\nLIMIT 20"
  },
  {
    id: "join-multiple",
    category: "JOINs",
    icon: GitBranch,
    title: "JOIN múltiple",
    description: "Combinar tres o más tablas",
    query: "SELECT u.name, m.title, w.watched_at\nFROM users u\nJOIN watch_history w ON u.id = w.user_id\nJOIN movies m ON w.movie_id = m.id\nORDER BY w.watched_at DESC\nLIMIT 20"
  },
  {
    id: "join-left",
    category: "JOINs",
    icon: GitBranch,
    title: "LEFT JOIN con NULLs",
    description: "Incluir registros sin relación",
    query: "SELECT u.name, COUNT(w.id) as peliculas_vistas\nFROM users u\nLEFT JOIN watch_history w ON u.id = w.user_id\nGROUP BY u.name\nORDER BY peliculas_vistas DESC"
  },
  {
    id: "aggregate-count",
    category: "Agregación",
    icon: Sigma,
    title: "COUNT + GROUP BY",
    description: "Contar registros agrupados",
    query: "SELECT m.genre, COUNT(*) as cantidad, ROUND(AVG(m.rating), 2) as rating_promedio\nFROM movies m\nGROUP BY m.genre\nORDER BY cantidad DESC"
  },
  {
    id: "aggregate-having",
    category: "Agregación",
    icon: Sigma,
    title: "HAVING + GROUP BY",
    description: "Filtrar grupos con HAVING",
    query: "SELECT m.genre, COUNT(*) as cantidad, AVG(m.rating) as rating_prom\nFROM movies m\nGROUP BY m.genre\nHAVING COUNT(*) > 1\nORDER BY rating_prom DESC"
  },
  {
    id: "aggregate-stats",
    category: "Agregación",
    icon: Sigma,
    title: "Estadísticas por tabla",
    description: "Funciones de agregación múltiples",
    query: "SELECT\n  COUNT(*) as total_peliculas,\n  AVG(rating) as rating_promedio,\n  MAX(rating) as rating_max,\n  MIN(rating) as rating_min,\n  AVG(duration_minutes) as duracion_promedio\nFROM movies"
  },
  {
    id: "order-simple",
    category: "Ordenamiento",
    icon: SortDesc,
    title: "ORDER BY básico",
    description: "Ordenar resultados ascendente/descendente",
    query: "SELECT title, rating, release_year\nFROM movies\nORDER BY rating DESC, release_year DESC"
  },
  {
    id: "order-limit",
    category: "Ordenamiento",
    icon: SortDesc,
    title: "Top N con ORDER BY + LIMIT",
    description: "Obtener los mejores resultados",
    query: "SELECT title, rating\nFROM movies\nORDER BY rating DESC\nLIMIT 5"
  },
  {
    id: "filter-date",
    category: "Filtros avanzados",
    icon: Filter,
    title: "Filtro por rango de fechas",
    description: "Buscar entre fechas específicas",
    query: "SELECT u.name, u.email, u.signup_date\nFROM users u\nWHERE u.signup_date BETWEEN '2024-01-01' AND '2024-06-30'\nORDER BY u.signup_date"
  },
  {
    id: "filter-like",
    category: "Filtros avanzados",
    icon: Filter,
    title: "Búsqueda con LIKE",
    description: "Búsqueda aproximada de texto",
    query: "SELECT *\nFROM movies\nWHERE title LIKE '%the%'\nORDER BY rating DESC"
  },
  {
    id: "subquery",
    category: "Filtros avanzados",
    icon: Filter,
    title: "Subconsulta en WHERE",
    description: "Filtrar con subconsulta",
    query: "SELECT title, rating\nFROM movies\nWHERE id IN (\n  SELECT movie_id\n  FROM watch_history\n  GROUP BY movie_id\n  HAVING COUNT(*) > 2\n)\nORDER BY rating DESC"
  }
]

interface QueryTemplatesProps {
  open: boolean
  onClose: () => void
  onInsert: (query: string) => void
}

export function QueryTemplates({ open, onClose, onInsert }: QueryTemplatesProps) {
  const [search, setSearch] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [category, setCategory] = useState<string | null>(null)

  const categories = [...new Set(templates.map((t) => t.category))]
  const filtered = templates.filter((t) => {
    if (category && t.category !== category) return false
    if (search) {
      const s = search.toLowerCase()
      return t.title.toLowerCase().includes(s) || t.description.toLowerCase().includes(s) || t.query.toLowerCase().includes(s)
    }
    return true
  })

  const handleInsert = (template: Template) => {
    onInsert(template.query)
    setCopiedId(template.id)
    setTimeout(() => setCopiedId(null), 1200)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 bg-black/60 p-4" onClick={onClose}>
      <Card
        className="relative w-full max-w-2xl border border-border bg-background shadow-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cerrar templates"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3 p-6 pb-3 border-b border-border shrink-0">
          <div className="size-10 flex items-center justify-center rounded bg-accent/10">
            <FileCode className="size-5 text-accent" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">Templates de consultas</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Elegí un template para insertarlo en el editor</p>
          </div>
        </div>

        <div className="px-6 pt-3 pb-2 border-b border-border shrink-0 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar templates..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-background border border-border rounded-none text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-accent"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => setCategory(null)}
              className={`px-2 h-7 text-[10px] whitespace-nowrap border transition-colors ${!category ? "border-accent text-accent" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              Todas
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c === category ? null : c)}
                className={`px-2 h-7 text-[10px] whitespace-nowrap border transition-colors ${category === c ? "border-accent text-accent" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 p-6 pt-3">
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">Sin resultados para "{search}"</p>
            ) : (
              filtered.map((t) => (
                <div
                  key={t.id}
                  className="p-3 border border-border rounded hover:border-accent/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="size-8 flex items-center justify-center rounded bg-muted shrink-0 mt-0.5">
                      <t.icon className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-foreground">{t.title}</span>
                        <Badge variant="sharp" className="text-[9px]">{t.category}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{t.description}</p>
                      <pre className="p-2 bg-muted/30 border border-border rounded text-[10px] font-mono text-accent overflow-x-auto mb-2 leading-relaxed">
                        {t.query}
                      </pre>
                      <Button
                        variant="sharp-accent"
                        size="sm"
                        onClick={() => handleInsert(t)}
                        className="h-7 text-[11px] gap-1.5"
                      >
                        {copiedId === t.id ? (
                          <><Check className="size-3" /> Insertado</>
                        ) : (
                          <><Copy className="size-3" /> Insertar en editor</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="px-6 py-3 border-t border-border text-[10px] text-muted-foreground shrink-0">
          {filtered.length} template{filtered.length !== 1 ? "s" : ""}
        </div>
      </Card>
    </div>
  )
}