import { useState, useCallback } from "react"
import type { QueryResponse } from "@/types"

type Status = "idle" | "loading" | "error" | "success"

interface QueryLabState {
  query: string
  status: Status
  result: QueryResponse | null
  error: string | null
}

export function useQueryLab() {
  const [state, setState] = useState<QueryLabState>({
    query: "",
    status: "idle",
    result: null,
    error: null,
  })

  const setQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, query }))
  }, [])

  const execute = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      status: "loading",
      error: null,
      result: null,
    }))

    try {
      const res = await fetch("/api/v1/query/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: state.query, dialect: "SQL" }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? `Server error: ${res.status}`)
      }

      const data: QueryResponse = await res.json()
      setState((prev) => ({
        ...prev,
        status: "success",
        result: data,
      }))
    } catch (err) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      }))
    }
  }, [state.query])

  return {
    ...state,
    setQuery,
    execute,
  }
}
