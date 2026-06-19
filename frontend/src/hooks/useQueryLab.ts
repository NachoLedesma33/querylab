import { useState, useCallback } from "react"
import type { QueryResponse } from "@/types"
import { useQueryHistory } from "./useQueryHistory"

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
  results: QueryResponse[]
  currentResultIndex: number
}

export function useQueryLab() {
  const { entries, addEntry, clearHistory } = useQueryHistory()
  const [state, setState] = useState<QueryLabState>({
    query: "",
    dialect: "SQL",
    sqlDialect: "H2",
    status: "idle",
    result: null,
    error: null,
    results: [],
    currentResultIndex: 0,
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

  const selectResult = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      currentResultIndex: index,
      result: prev.results[index] ?? null,
    }))
  }, [])

  const setAndExecute = useCallback(async (query: string) => {
    setState((prev) => ({ ...prev, query }))
    const baseUrl = import.meta.env.VITE_API_URL ?? ""
    const dialect = state.dialect
    const sqlDialect = state.sqlDialect

    setState((prev) => ({
      ...prev,
      query,
      status: "loading",
      error: null,
      result: null,
      results: [],
      currentResultIndex: 0,
    }))

    try {
      const res = await fetch(`${baseUrl}/api/v1/query/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, dialect, sqlDialect }),
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
      addEntry(query, dialect, sqlDialect)
      setState((prev) => ({
        ...prev,
        status: "success",
        result: data,
        results: [data],
        currentResultIndex: 0,
      }))
    } catch (err) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: err instanceof Error ? err.message : "Error desconocido",
        results: [],
      }))
    }
  }, [state.dialect, state.sqlDialect, addEntry])

  const execute = useCallback(async () => {
    const rawQuery = state.query.trim()
    if (!rawQuery) return

    const statements = rawQuery
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    if (statements.length === 0) return

    setState((prev) => ({
      ...prev,
      status: "loading",
      error: null,
      result: null,
      results: [],
      currentResultIndex: 0,
    }))

    const baseUrl = import.meta.env.VITE_API_URL ?? ""
    const results: QueryResponse[] = []
    let firstError: string | null = null

    for (const stmt of statements) {
      try {
        const res = await fetch(`${baseUrl}/api/v1/query/execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: stmt,
            dialect: state.dialect,
            sqlDialect: state.sqlDialect,
          }),
        })

        if (!res.ok) {
          let msg: string
          try {
            const body = await res.json()
            msg = body?.message ?? `Error del servidor: ${res.status}`
          } catch {
            const text = await res.text().catch(() => null)
            msg = text ? `Error ${res.status}: ${text.slice(0, 300)}` : `Error del servidor: ${res.status}`
          }
          if (!firstError) firstError = `Error en sentencia ${results.length + 1}: ${msg}`
          break
        }

        const data: QueryResponse = await res.json()
        results.push(data)
      } catch (err) {
        if (!firstError) firstError = `Error en sentencia ${results.length + 1}: ${err instanceof Error ? err.message : "Error desconocido"}`
        break
      }
    }

    if (firstError && results.length === 0) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: firstError,
        results: [],
      }))
      return
    }

    if (results.length > 0) {
      addEntry(rawQuery, state.dialect, state.sqlDialect)
    }

    setState((prev) => ({
      ...prev,
      status: firstError ? "error" : "success",
      result: results[0] ?? null,
      results,
      currentResultIndex: 0,
      error: firstError,
    }))
  }, [state.query, state.dialect, state.sqlDialect, addEntry])

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
        results: [],
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
    history: entries,
    clearHistory,
    setQuery,
    setDialect,
    setSqlDialect,
    setAndExecute,
    execute,
    selectResult,
    resetDatabase,
  }
}
