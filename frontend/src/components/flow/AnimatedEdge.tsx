import { memo } from "react"
import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
  type Edge,
} from "@xyflow/react"
import { motion } from "framer-motion"

export type AnimatedEdgeType = Edge<{ active?: boolean }, "animatedEdge">

function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<AnimatedEdgeType>) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ stroke: "#818cf8", strokeWidth: 2 }} />
      {data?.active && (
        <motion.circle
          r={4}
          fill="#a78bfa"
          filter="url(#glow)"
          initial={{ pathOffset: 0 }}
          animate={{ pathOffset: 1 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            offsetPath: `path('${edgePath}')`,
            offsetRotate: "0deg",
          }}
        />
      )}
    </>
  )
}

export default memo(AnimatedEdge)
