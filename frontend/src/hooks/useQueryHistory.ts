import { useState, useCallback } from "react"

export interface HistoryEntry {
  query: string
  dialect: string
  sqlDialect: string
  timestamp: number
}

const STORAGE_KEY = "querylab-history"
const MAX_ENTRIES = 50

export function useQueryHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as HistoryEntry[]) : []
    } catch {
      return []
    }
  })

  const addEntry = useCallback((query: string, dialect: string, sqlDialect: string) => {
    const entry: HistoryEntry = { query, dialect, sqlDialect, timestamp: Date.now() }
    setEntries((prev) => {
      const next = [entry, ...prev.filter((e) => e.query !== query)].slice(0, MAX_ENTRIES)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearHistory = useCallback(() => {
    setEntries([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { entries, addEntry, clearHistory }
}
