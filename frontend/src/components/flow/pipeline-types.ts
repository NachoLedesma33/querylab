export type PipelineStep = "scan" | "join" | "filter"

export interface PipelineState {
  active: boolean
  currentStep: PipelineStep | null
  completedSteps: PipelineStep[]
}
