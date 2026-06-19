import { memo } from "react"
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react"
import { KeyRound, Scan } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { PipelineStep } from "./pipeline-types"

interface ColumnData {
  name: string
  type: string
  primaryKey?: boolean
  foreignKey?: boolean
}

export interface TableNodeData extends Record<string, unknown> {
  label: string
  columns: ColumnData[]
  highlighted?: boolean
  pipelineStep?: PipelineStep | null
  rows?: { filtered: string[]; kept: string[] }
}

export type TableNodeType = Node<TableNodeData, "tableNode">

function TableNode({ data }: NodeProps<TableNodeType>) {
  const hasGlow = data.highlighted && data.pipelineStep === "scan"
  const showRows = data.pipelineStep === "filter" && data.rows

  return (
    <motion.div
      animate={
        hasGlow
          ? {
              boxShadow: [
                "0 0 0px rgba(129,140,248,0)",
                "0 0 20px rgba(129,140,248,0.6)",
                "0 0 0px rgba(129,140,248,0)",
              ],
            }
          : { boxShadow: "0 0 0px rgba(129,140,248,0)" }
      }
      transition={{ duration: 1.5, repeat: hasGlow ? Infinity : 0, ease: "easeInOut" }}
      className={`rounded-xl border-2 bg-card shadow-lg shadow-black/20 min-w-[200px] transition-colors ${
        hasGlow ? "border-indigo-400" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-muted/50 rounded-t-xl">
        {hasGlow && <Scan className="size-3.5 text-indigo-400 animate-pulse" />}
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

      <AnimatePresence>
        {showRows && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border"
          >
            {data.rows!.kept.map((row, i) => (
              <motion.div
                key={`kept-${i}`}
                className="px-3 py-1 text-[10px] font-mono text-green-400/80 bg-green-500/5"
              >
                {row}
              </motion.div>
            ))}
            {data.rows!.filtered.map((row, i) => (
              <motion.div
                key={`filtered-${i}`}
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 0 }}
                transition={{ delay: i * 0.3, duration: 0.5 }}
                className="px-3 py-1 text-[10px] font-mono text-red-400/60 bg-red-500/5"
              >
                {row}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

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
    </motion.div>
  )
}

export default memo(TableNode)
