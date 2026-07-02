import { useMemo, useState, useRef, useEffect } from "react"

interface ColumnStatsProps {
  column: string
  rows: Record<string, unknown>[]
  onClose: () => void
  anchorEl: HTMLElement | null
}

interface ColumnProfile {
  type: "number" | "string" | "date" | "boolean" | "mixed"
  count: number
  nulls: number
  distinct: number
  min: string
  max: string
  avg?: string
  sum?: string
  mostCommon?: string
  topFreq?: number
}

function profileColumn(column: string, rows: Record<string, unknown>[]): ColumnProfile {
  const vals: unknown[] = []
  let nulls = 0
  for (const row of rows) {
    const v = Object.prototype.hasOwnProperty.call(row, column)
      ? row[column]
      : row[Object.keys(row).find((k) => k.toLowerCase() === column.toLowerCase()) ?? ""]
    if (v == null || v === "") { nulls++; continue }
    vals.push(v)
  }

  const count = vals.length
  const distinct = new Set(vals.map((v) => String(v))).size
  const numVals = vals.filter((v) => !isNaN(Number(v)) && v !== true && v !== false).map(Number)
  const strVals = vals.filter((v) => typeof v === "string" || typeof v === "number").map(String)
  const dateVals = vals.filter((v) => typeof v === "string" && !isNaN(Date.parse(v as string))).map((v) => new Date(v as string))

  const isNumeric = numVals.length > 0 && numVals.length >= vals.length * 0.7
  const isDate = dateVals.length > 0 && dateVals.length >= vals.length * 0.7

  let type: ColumnProfile["type"] = "mixed"
  let min = "", max = "", avg: string | undefined, sum: string | undefined
  let mostCommon: string | undefined, topFreq: number | undefined

  if (isNumeric) {
    type = "number"
    min = String(Math.min(...numVals))
    max = String(Math.max(...numVals))
    sum = String(numVals.reduce((a, b) => a + b, 0))
    avg = String(Math.round((numVals.reduce((a, b) => a + b, 0) / numVals.length) * 100) / 100)
  } else if (isDate) {
    type = "date"
    min = dateVals.reduce((a, b) => a < b ? a : b).toISOString().split("T")[0]
    max = dateVals.reduce((a, b) => a > b ? a : b).toISOString().split("T")[0]
  } else if (vals.every((v) => typeof v === "boolean")) {
    type = "boolean"
  } else {
    type = "string"
    const freq: Record<string, number> = {}
    for (const v of strVals) { freq[v] = (freq[v] || 0) + 1 }
    let maxFreq = 0
    let mostFreq = ""
    for (const [k, f] of Object.entries(freq)) {
      if (f > maxFreq) { maxFreq = f; mostFreq = k }
    }
    mostCommon = mostFreq
    topFreq = maxFreq
  }

  return { type, count, nulls, distinct, min, max, avg, sum, mostCommon, topFreq }
}

export function ColumnStats({ column, rows, onClose, anchorEl }: ColumnStatsProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect()
      setPosition({ top: rect.bottom + 4, left: Math.max(8, rect.left) })
    }
  }, [anchorEl])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && anchorEl && !anchorEl.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [onClose, anchorEl])

  const stats = useMemo(() => profileColumn(column, rows), [column, rows])

  const typeLabel = { number: "NUMBER", string: "STRING", date: "DATE", boolean: "BOOLEAN", mixed: "MIXED" }[stats.type]
  const typeColor = { number: "text-sky-400", string: "text-green-400", date: "text-amber-400", boolean: "text-purple-400", mixed: "text-muted-foreground" }[stats.type]

  return (
    <div
      ref={ref}
      className="fixed z-[60] w-56 bg-background border border-border shadow-xl p-3"
      style={{ top: position.top, left: position.left }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-foreground truncate max-w-[140px]">{column}</span>
        <span className={`text-[10px] font-mono ${typeColor}`}>{typeLabel}</span>
      </div>
      <table className="w-full text-[10px]">
        <tbody>
          <tr><td className="text-muted-foreground pr-2">Filas</td><td className="text-foreground text-right font-mono">{rows.length}</td></tr>
          <tr><td className="text-muted-foreground pr-2">No nulos</td><td className="text-foreground text-right font-mono">{stats.count}</td></tr>
          <tr><td className="text-muted-foreground pr-2">Nulos</td><td className="text-foreground text-right font-mono">{stats.nulls}</td></tr>
          <tr><td className="text-muted-foreground pr-2">Distintos</td><td className="text-foreground text-right font-mono">{stats.distinct}</td></tr>
          {stats.type === "number" && (
            <>
              <tr><td className="text-muted-foreground pr-2">Min</td><td className="text-foreground text-right font-mono">{stats.min}</td></tr>
              <tr><td className="text-muted-foreground pr-2">Max</td><td className="text-foreground text-right font-mono">{stats.max}</td></tr>
              <tr><td className="text-muted-foreground pr-2">Promedio</td><td className="text-foreground text-right font-mono">{stats.avg}</td></tr>
              <tr><td className="text-muted-foreground pr-2">Suma</td><td className="text-foreground text-right font-mono">{stats.sum}</td></tr>
            </>
          )}
          {stats.type === "string" && stats.mostCommon && (
            <tr><td className="text-muted-foreground pr-2">Frecuente</td><td className="text-foreground text-right font-mono truncate max-w-[100px]">{stats.mostCommon} ({stats.topFreq})</td></tr>
          )}
          {stats.type === "date" && (
            <>
              <tr><td className="text-muted-foreground pr-2">Min</td><td className="text-foreground text-right font-mono">{stats.min}</td></tr>
              <tr><td className="text-muted-foreground pr-2">Max</td><td className="text-foreground text-right font-mono">{stats.max}</td></tr>
            </>
          )}
          {stats.type === "boolean" && (
            <tr><td className="text-muted-foreground pr-2">Valores</td><td className="text-foreground text-right font-mono">true/false</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}