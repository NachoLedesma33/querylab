import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { SavedQuery } from "@/hooks/useQuerySaves"
import { Save, FolderOpen, X, Trash2, Search, Play, Check } from "lucide-react"

interface SaveQueryDialogProps {
  open: boolean
  onClose: () => void
  saved: SavedQuery[]
  onSave: (name: string, description?: string) => void
  onLoad: (query: string) => void
  onDelete: (id: string) => void
  currentQuery: string
}

export function SaveQueryDialog({ open, onClose, saved, onSave, onLoad, onDelete, currentQuery }: SaveQueryDialogProps) {
  const [tab, setTab] = useState<"save" | "load">("load")
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [savedId, setSavedId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search.trim()) return saved
    const s = search.toLowerCase()
    return saved.filter((q) => q.name.toLowerCase().includes(s) || q.query.toLowerCase().includes(s))
  }, [saved, search])

  const handleSave = () => {
    if (!name.trim()) return
    onSave(name.trim(), desc.trim() || undefined)
    setSavedId("new")
    setTimeout(() => setSavedId(null), 1000)
    setName("")
    setDesc("")
  }

  const handleLoad = (q: SavedQuery) => {
    onLoad(q.query)
    setSavedId(q.id)
    setTimeout(() => setSavedId(null), 800)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/60 p-4" onClick={onClose}>
      <Card className="relative w-full max-w-lg border border-border bg-background shadow-2xl max-h-[75vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground transition-colors" aria-label="Cerrar">
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3 p-6 pb-3 border-b border-border shrink-0">
          <div className="size-10 flex items-center justify-center rounded bg-accent/10">
            <FolderOpen className="size-5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Consultas guardadas</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{saved.length} consulta{saved.length !== 1 ? "s" : ""} guardada{saved.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="flex border-b border-border shrink-0">
          {(["load", "save"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-1.5 h-9 text-xs font-medium transition-colors ${
                tab === t ? "text-accent border-b-2 border-accent" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "load" ? <FolderOpen className="size-3.5" /> : <Save className="size-3.5" />}
              {t === "load" ? "Cargar" : "Guardar nueva"}
            </button>
          ))}
        </div>

        {tab === "load" ? (
          <>
            <div className="p-3 pb-0 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="w-full h-7 pl-7 pr-2 text-[11px] bg-background border border-border text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-accent" />
              </div>
            </div>
            <ScrollArea className="flex-1 p-3">
              {filtered.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  {search ? `Sin resultados para "${search}"` : "No hay consultas guardadas aún"}
                </p>
              ) : (
                <div className="space-y-1.5">
                  {filtered.map((q) => {
                    const isCurrent = savedId === q.id
                    return (
                      <div key={q.id} className={`p-3 border rounded transition-colors ${isCurrent ? "border-accent bg-accent/[0.03]" : "border-border hover:border-accent/40"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground truncate">{q.name}</span>
                              <Badge variant="sharp" className="text-[9px]">{q.dialect === "SQL" ? q.sqlDialect : "GraphQL"}</Badge>
                            </div>
                            {q.description && <p className="text-[10px] text-muted-foreground mt-0.5">{q.description}</p>}
                            <pre className="mt-1.5 p-1.5 bg-muted/30 border border-border rounded text-[10px] font-mono text-accent overflow-x-auto">{q.query.length > 80 ? q.query.slice(0, 80) + "..." : q.query}</pre>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="sharp-accent" size="icon-xs" onClick={() => handleLoad(q)} className="size-6" aria-label={`Cargar ${q.name}`} title="Cargar">
                              {isCurrent ? <Check className="size-3" /> : <Play className="size-3" />}
                            </Button>
                            <Button variant="sharp" size="icon-xs" onClick={() => onDelete(q.id)} className="size-6" aria-label={`Eliminar ${q.name}`} title="Eliminar">
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </>
        ) : (
          <div className="p-6 space-y-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Nombre</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Películas con mejor rating"
                className="w-full h-8 px-2 text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-accent"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Descripción (opcional)</label>
              <input
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Descripción breve..."
                className="w-full h-8 px-2 text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-accent"
              />
            </div>
            <pre className="p-2 bg-muted/30 border border-border rounded text-[10px] font-mono text-accent overflow-x-auto max-h-20">
              {currentQuery || "(editor vacío)"}
            </pre>
            <Button variant="sharp-accent" size="sm" onClick={handleSave} disabled={!name.trim() || !currentQuery.trim()} className="w-full justify-center gap-1.5">
              <Save className="size-3" /> Guardar consulta
            </Button>
            {savedId === "new" && <p className="text-[10px] text-accent text-center">✅ Guardado correctamente</p>}
          </div>
        )}

        <div className="px-6 py-3 border-t border-border text-[10px] text-muted-foreground shrink-0">
          {tab === "load" ? `${filtered.length} de ${saved.length} consultas` : "Las consultas se guardan en el navegador"}
        </div>
      </Card>
    </div>
  )
}