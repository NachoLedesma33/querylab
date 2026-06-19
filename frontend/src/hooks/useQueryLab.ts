import { useState, useCallback } from "react"
import type { QueryResponse } from "@/types"

type Status = "idle" | "loading" | "error" | "success"
type Dialect = "SQL" | "GraphQL"
type SqlDialect = "H2" | "MySQL" | "PostgreSQL" | "SQLServer" | "Oracle"

interface QueryLabState {
  query: string
  dialect: Dialect
  sqlDialect: SqlDialect
  status: Status
  result: QueryResponse | null
  error: string | null
}

export function useQueryLab() {
  const [state, setState] = useState<QueryLabState>({
    query: "",
    dialect: "SQL",
    sqlDialect: "H2",
    status: "idle",
    result: null,
    error: null,
  })

  const setQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, query }))
  }, [])

  const setDialect = useCallback((dialect: Dialect) => {
    setState((prev) => ({ ...prev, dialect }))
  }, [])

  const setSqlDialect = useCallback((sqlDialect: SqlDialect) => {
    setState((prev) => ({ ...prev, sqlDialect }))
  }, [])

  const execute = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      status: "loading",
      error: null,
      result: null,
    }))

    try {
      const baseUrl = import.meta.env.VITE_API_URL ?? ""
      const res = await fetch(`${baseUrl}/api/v1/query/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: state.query,
          dialect: state.dialect,
          sqlDialect: state.sqlDialect,
        }),
      })

      if (!res.ok) {
        let message: string
        try {
          const body = await res.json()
          message = body?.message ?? `Error del servidor: ${res.status}`
        } catch {
          const text = await res.text().catch(() => null)
          message = text
            ? `Error ${res.status}: ${text.slice(0, 300)}`
            : `Error del servidor: ${res.status}`
        }
        throw new Error(message)
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
        error: err instanceof Error ? err.message : "Error desconocido",
      }))
    }
  }, [state.query, state.dialect, state.sqlDialect])

  const resetDatabase = useCallback(async () => {
    const confirmed = window.confirm(
      "Esto restaurará la base de datos a su estado original.\n" +
      "Todos los datos iniciales serán recuperados. ¿Continuar?"
    )
    if (!confirmed) return

    try {
      const baseUrl = import.meta.env.VITE_API_URL ?? ""
      const res = await fetch(`${baseUrl}/api/v1/admin/reset`, {
        method: "POST",
      })

      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? `Error al restaurar: ${res.status}`)
      }

      const body = await res.json()
      setState((prev) => ({
        ...prev,
        status: "success",
        result: null,
        error: null,
      }))
      alert(body.message)
    } catch (err) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: err instanceof Error ? err.message : "Error al restaurar la base de datos",
      }))
    }
  }, [])

  return {
    ...state,
    setQuery,
    setDialect,
    setSqlDialect,
    execute,
    resetDatabase,
  }
}
