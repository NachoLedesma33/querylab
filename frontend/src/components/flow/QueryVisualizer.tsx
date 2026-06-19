import { useCallback, useEffect } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Connection,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import TableNode, { type TableNodeType } from "./TableNode"
import AnimatedEdge, { type AnimatedEdgeType } from "./AnimatedEdge"
import type { TableSchema } from "@/types"
import type { PipelineState } from "./pipeline-types"

const nodeTypes = { tableNode: TableNode }
const edgeTypes = { animatedEdge: AnimatedEdge }

const defaultSchema: TableSchema[] = [
  {
    name: "movies",
    columns: [
      { name: "id", type: "BIGINT PK" },
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
      { name: "id", type: "BIGINT PK" },
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
      { name: "id", type: "BIGINT PK" },
      { name: "user_id", type: "BIGINT FK" },
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
      { name: "id", type: "BIGINT PK" },
      { name: "user_id", type: "BIGINT FK" },
      { name: "movie_id", type: "BIGINT FK" },
      { name: "watched_at", type: "TIMESTAMP" },
      { name: "progress_seconds", type: "INT" },
      { name: "completed", type: "BOOLEAN" },
    ],
  },
]

function buildNodes(
  schema: TableSchema[],
  pipeline: PipelineState,
  tables: string[]
): TableNodeType[] {
  const gapX = 320
  const gapY = 180

  return schema.map((table, i) => {
    const isLeft = i < 2
    const index = isLeft ? i : i - 2
    const isInvolved = tables.includes(table.name)
    const isHighlighted = pipeline.active && isInvolved

    let rows: { filtered: string[]; kept: string[] } | undefined
    if (pipeline.currentStep === "filter" && isInvolved) {
      rows = {
        kept: ["row: id=1, title='...'", "row: id=3, title='...'"],
        filtered: ["row: id=2, title='...'", "row: id=4, title='...'", "row: id=5, title='...'"],
      }
    }

    return {
      id: table.name,
      type: "tableNode",
      position: {
        x: isLeft ? 0 : gapX * 1.8,
        y: index * gapY,
      },
      data: {
        label: table.name,
        columns: table.columns.map((col) => ({
          name: col.name,
          type: col.type.replace(" PK", "").replace(" FK", ""),
          primaryKey: col.type.includes("PK"),
          foreignKey: col.type.includes("FK"),
        })),
        highlighted: isHighlighted,
        pipelineStep: pipeline.active ? pipeline.currentStep : null,
        rows,
      },
    }
  })
}

function buildEdges(pipeline: PipelineState): AnimatedEdgeType[] {
  const edgeDefs = [
    { id: "e-users-subscriptions", source: "users", target: "subscriptions" },
    { id: "e-users-watch_history", source: "users", target: "watch_history" },
    { id: "e-movies-watch_history", source: "movies", target: "watch_history" },
  ]

  return edgeDefs.map((def) => ({
    ...def,
    type: "animatedEdge",
    style: { stroke: "#818cf8", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#818cf8" },
    data: { active: pipeline.currentStep === "join" && pipeline.active },
  }))
}

interface QueryVisualizerProps {
  schema?: TableSchema[]
  pipeline?: PipelineState
  tables?: string[]
}

export function QueryVisualizer({
  schema = defaultSchema,
  pipeline = { active: false, currentStep: null, completedSteps: [] },
  tables = [],
}: QueryVisualizerProps) {
  const initialNodes = buildNodes(schema, pipeline, tables)
  const initialEdges = buildEdges(pipeline)

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    setNodes(buildNodes(schema, pipeline, tables))
    setEdges(buildEdges(pipeline))
  }, [pipeline, tables, schema, setNodes, setEdges])

  const onConnect = useCallback((connection: Connection) => {
    console.log("connect", connection)
  }, [])

  return (
    <div className="w-full h-full" role="region" aria-label="Database schema visualization">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        colorMode="dark"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#1e1e2e"
        />
        <Controls
          showInteractive={false}
          className="!bg-card !border-border !rounded-lg"
        />
        <MiniMap
          nodeStrokeColor="#818cf8"
          nodeColor="#12121a"
          nodeBorderRadius={8}
          maskColor="rgba(10,10,15,0.7)"
          className="!border-border !rounded-lg"
        />
      </ReactFlow>
    </div>
  )
}
