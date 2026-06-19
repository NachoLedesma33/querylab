import { memo } from "react"
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react"
import { KeyRound } from "lucide-react"

interface ColumnData {
  name: string
  type: string
  primaryKey?: boolean
  foreignKey?: boolean
}

export interface TableNodeData extends Record<string, unknown> {
  label: string
  columns: ColumnData[]
}

export type TableNodeType = Node<TableNodeData, "tableNode">

function TableNode({ data }: NodeProps<TableNodeType>) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-lg shadow-black/20 min-w-[200px]">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-muted/50 rounded-t-xl">
        <span className="text-sm font-semibold text-card-foreground">
          {data.label}
        </span>
      </div>
      <div className="py-1">
        {data.columns.map((col) => (
          <div
            key={col.name}
            className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-1 w-4 shrink-0">
              {col.primaryKey && <KeyRound className="size-3 text-amber-400" />}
              {col.foreignKey && !col.primaryKey && (
                <KeyRound className="size-3 text-indigo-400" />
              )}
            </div>
            <span className="font-mono text-card-foreground/90">{col.name}</span>
            <span className="ml-auto text-[10px] text-muted-foreground/60">
              {col.type}
            </span>
          </div>
        ))}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="!size-2.5 !border-2 !border-border !bg-background"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!size-2.5 !border-2 !border-border !bg-background"
      />
    </div>
  )
}

export default memo(TableNode)
