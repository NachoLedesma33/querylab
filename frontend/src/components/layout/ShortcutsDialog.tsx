import { Button } from "@/components/ui/button"
import { Keyboard, X } from "lucide-react"

interface ShortcutGroup {
  group: string
  shortcuts: { keys: string; desc: string }[]
}

const groups: ShortcutGroup[] = [
  {
    group: "Editor",
    shortcuts: [
      { keys: "Ctrl + Enter", desc: "Ejecutar consulta" },
      { keys: "Ctrl + Space", desc: "Autocompletar" },
    ],
  },
  {
    group: "Sidebar",
    shortcuts: [
      { keys: "Click ▶", desc: "SELECT * FROM tabla LIMIT 5" },
      { keys: "Drag tabla", desc: "Arrastrar tabla al editor" },
    ],
  },
  {
    group: "General",
    shortcuts: [
      { keys: "Botón ✨", desc: "Formatear SQL" },
      { keys: "Botón 🌙/☀", desc: "Cambiar tema" },
    ],
  },
]

export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-label="Atajos de teclado"
    >
      <div
        className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 h-12 border-b border-border">
          <div className="flex items-center gap-2">
            <Keyboard className="size-4 text-indigo-400" />
            <span className="text-sm font-semibold">Atajos de teclado</span>
          </div>
          <Button variant="ghost" size="xs" onClick={onClose} aria-label="Cerrar">
            <X className="size-3.5" />
          </Button>
        </div>
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {groups.map((g) => (
            <div key={g.group}>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {g.group}
              </h4>
              <div className="space-y-1">
                {g.shortcuts.map((s) => (
                  <div key={s.keys} className="flex items-center justify-between text-sm">
                    <span className="text-foreground/80">{s.desc}</span>
                    <kbd className="px-2 py-0.5 rounded bg-muted text-[11px] font-mono text-muted-foreground">
                      {s.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
