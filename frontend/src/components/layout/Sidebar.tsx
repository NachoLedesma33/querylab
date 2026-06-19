import { useState } from "react"
import type { TableSchema } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Database,
  ChevronRight,
  ChevronDown,
  Table2,
  Columns3,
} from "lucide-react"

const defaultSchema: TableSchema[] = [
  {
    name: "movies",
    columns: [
      { name: "id", type: "BIGINT" },
      { name: "title", type: "VARCHAR(255)" },
      { name: "genre", type: "VARCHAR(100)" },
      { name: "release_year", type: "INT" },
      { name: "rating", type: "DECIMAL(3,1)" },
      { name: "duration_minutes", type: "INT" },
      { name: "director", type: "VARCHAR(255)" },
    ],
  },
  {
    name: "users",
    columns: [
      { name: "id", type: "BIGINT" },
      { name: "name", type: "VARCHAR(255)" },
      { name: "email", type: "VARCHAR(255)" },
      { name: "age", type: "INT" },
      { name: "signup_date", type: "DATE" },
      { name: "country", type: "VARCHAR(100)" },
    ],
  },
  {
    name: "subscriptions",
    columns: [
      { name: "id", type: "BIGINT" },
      { name: "user_id", type: "BIGINT" },
      { name: "plan", type: "VARCHAR(50)" },
      { name: "price", type: "DECIMAL(6,2)" },
      { name: "start_date", type: "DATE" },
      { name: "end_date", type: "DATE" },
      { name: "active", type: "BOOLEAN" },
    ],
  },
  {
    name: "watch_history",
    columns: [
      { name: "id", type: "BIGINT" },
      { name: "user_id", type: "BIGINT" },
      { name: "movie_id", type: "BIGINT" },
      { name: "watched_at", type: "TIMESTAMP" },
      { name: "progress_seconds", type: "INT" },
      { name: "completed", type: "BOOLEAN" },
    ],
  },
]

function SchemaTable({ table }: { table: TableSchema }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 text-sm font-normal"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`Toggle ${table.name} columns`}
      >
        {open ? (
          <ChevronDown className="size-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-3.5 text-muted-foreground" />
        )}
        <Table2 className="size-4 text-indigo-400" />
        <span>{table.name}</span>
        <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0">
          {table.columns.length}
        </Badge>
      </Button>
      {open && (
        <div className="ml-6 border-l border-border pl-3 py-1 space-y-0.5">
          {table.columns.map((col) => (
            <div
              key={col.name}
              className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors rounded"
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

export function Sidebar() {
  return (
    <aside
      className="w-64 border-r border-border bg-sidebar shrink-0 flex flex-col"
      aria-label="Database schema navigator"
    >
      <div className="flex items-center gap-2 px-4 h-12 border-b border-border">
        <Database className="size-4 text-indigo-400" />
        <span className="text-sm font-semibold text-sidebar-foreground">
          Schema
        </span>
      </div>
      <ScrollArea className="flex-1 p-2">
        <nav role="tree" aria-label="Tables">
          {defaultSchema.map((table) => (
            <SchemaTable key={table.name} table={table} />
          ))}
        </nav>
      </ScrollArea>
    </aside>
  )
}
