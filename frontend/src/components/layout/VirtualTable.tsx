import { useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"

interface VirtualTableProps {
  rows: Record<string, unknown>[]
  columns: string[]
  getRowValue: (row: Record<string, unknown>, col: string) => unknown
  rowHeight?: number
}

export function VirtualTable({ rows, columns, getRowValue, rowHeight = 24 }: VirtualTableProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 20,
  })

  return (
    <div ref={parentRef} className="overflow-auto flex-1 min-h-0" role="region" aria-label="Resultados virtualizados">
      <div style={{ height: virtualizer.getTotalSize(), position: "relative", minWidth: "100%" }}>
        <table className="w-full text-xs border-collapse" role="table" aria-label="Resultados">
          <thead>
            <tr className="border-b border-border sticky top-0 bg-muted/20" style={{ zIndex: 1 }}>
              {columns.map((col) => (
                <th key={col} className="text-left px-2 py-1 text-[10px] font-semibold text-accent uppercase tracking-wider" scope="col">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const row = rows[virtualItem.index]
              return (
                <tr
                  key={virtualItem.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col} className="px-2 py-0.5 text-xs font-mono text-foreground/90 truncate max-w-[200px]">
                      {String(getRowValue(row, col) ?? "")}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}