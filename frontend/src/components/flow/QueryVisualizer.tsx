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
import type { TableSchema } from "../../types"
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
  {
    name: "directors",
    columns: [
      { name: "id", type: "BIGINT PK" },
      { name: "name", type: "VARCHAR(255)" },
      { name: "birth_date", type: "DATE" },
      { name: "nationality", type: "VARCHAR(100)" },
      { name: "awards", type: "INT" },
    ],
  },
  {
    name: "actors",
    columns: [
      { name: "id", type: "BIGINT PK" },
      { name: "name", type: "VARCHAR(255)" },
      { name: "birth_date", type: "DATE" },
      { name: "nationality", type: "VARCHAR(100)" },
      { name: "active", type: "BOOLEAN" },
    ],
  },
  {
    name: "movie_actors",
    columns: [
      { name: "id", type: "BIGINT PK" },
      { name: "movie_id", type: "BIGINT FK" },
      { name: "actor_id", type: "BIGINT FK" },
      { name: "role", type: "VARCHAR(100)" },
    ],
  },
  {
    name: "reviews",
    columns: [
      { name: "id", type: "BIGINT PK" },
      { name: "user_id", type: "BIGINT FK" },
      { name: "movie_id", type: "BIGINT FK" },
      { name: "rating", type: "INT" },
      { name: "comment", type: "TEXT" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "playlists",
    columns: [
      { name: "id", type: "BIGINT PK" },
      { name: "user_id", type: "BIGINT FK" },
      { name: "name", type: "VARCHAR(255)" },
      { name: "description", type: "TEXT" },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "is_public", type: "BOOLEAN" },
    ],
  },
  {
    name: "playlist_items",
    columns: [
      { name: "id", type: "BIGINT PK" },
      { name: "playlist_id", type: "BIGINT FK" },
      { name: "movie_id", type: "BIGINT FK" },
      { name: "added_at", type: "TIMESTAMP" },
      { name: "position", type: "INT" },
    ],
  },
  {
    name: "genres",
    columns: [
      { name: "id", type: "BIGINT PK" },
      { name: "name", type: "VARCHAR(100)" },
      { name: "description", type: "TEXT" },
    ],
  },
  {
    name: "payments",
    columns: [
      { name: "id", type: "BIGINT PK" },
      { name: "user_id", type: "BIGINT FK" },
      { name: "amount", type: "DECIMAL(10,2)" },
      { name: "payment_date", type: "TIMESTAMP" },
      { name: "method", type: "VARCHAR(50)" },
      { name: "status", type: "VARCHAR(20)" },
    ],
  },
  {
    name: "notifications",
    columns: [
      { name: "id", type: "BIGINT PK" },
      { name: "user_id", type: "BIGINT FK" },
      { name: "title", type: "VARCHAR(255)" },
      { name: "message", type: "TEXT" },
      { name: "is_read", type: "BOOLEAN" },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "type", type: "VARCHAR(50)" },
    ],
  },
  {
    name: "settings",
    columns: [
      { name: "id", type: "BIGINT PK" },
      { name: "user_id", type: "BIGINT FK" },
      { name: "language", type: "VARCHAR(10)" },
      { name: "theme", type: "VARCHAR(20)" },
      { name: "notifications_enabled", type: "BOOLEAN" },
      { name: "autoplay", type: "BOOLEAN" },
      { name: "quality", type: "VARCHAR(20)" },
    ],
  },
  {
    name: "watchlists",
    columns: [
      { name: "id", type: "BIGINT PK" },
      { name: "user_id", type: "BIGINT FK" },
      { name: "name", type: "VARCHAR(255)" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "watchlist_items",
    columns: [
      { name: "id", type: "BIGINT PK" },
      { name: "watchlist_id", type: "BIGINT FK" },
      { name: "movie_id", type: "BIGINT FK" },
      { name: "added_at", type: "TIMESTAMP" },
      { name: "priority", type: "INT" },
    ],
  },
]

function buildNodes(
  schema: TableSchema[],
  pipeline: PipelineState,
  tables: string[]
): TableNodeType[] {
  const cols = 4
  const gapX = 280
  const gapY = 220

  return schema.map((table, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
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
        x: col * gapX,
        y: row * gapY,
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
    { id: "e-movies-movie_actors", source: "movies", target: "movie_actors" },
    { id: "e-actors-movie_actors", source: "actors", target: "movie_actors" },
    { id: "e-users-reviews", source: "users", target: "reviews" },
    { id: "e-movies-reviews", source: "movies", target: "reviews" },
    { id: "e-users-playlists", source: "users", target: "playlists" },
    { id: "e-playlists-playlist_items", source: "playlists", target: "playlist_items" },
    { id: "e-movies-playlist_items", source: "movies", target: "playlist_items" },
    { id: "e-users-payments", source: "users", target: "payments" },
    { id: "e-users-notifications", source: "users", target: "notifications" },
    { id: "e-users-settings", source: "users", target: "settings" },
    { id: "e-users-watchlists", source: "users", target: "watchlists" },
    { id: "e-watchlists-watchlist_items", source: "watchlists", target: "watchlist_items" },
    { id: "e-movies-watchlist_items", source: "movies", target: "watchlist_items" },
  ]

  return edgeDefs.map((def) => ({
    ...def,
    type: "animatedEdge",
    style: { stroke: "#d4a017", strokeWidth: 1 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#d4a017" },
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
    <div className="relative h-full w-full min-h-[360px]" role="region" aria-label="Visualización del esquema de base de datos">
      <ReactFlow
        className="h-full w-full"
        style={{ width: "100%", height: "100%" }}
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
