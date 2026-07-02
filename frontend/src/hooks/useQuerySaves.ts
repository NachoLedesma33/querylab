import { useState, useCallback } from "react"

export interface SavedQuery {
  id: string
  name: string
  query: string
  dialect: string
  sqlDialect: string
  timestamp: number
  description?: string
}

const STORAGE_KEY = "querylab-saved"
const MAX_SAVED = 30

let idCounter = Date.now()
function genId() { return `q_${++idCounter}` }

export function useQuerySaves() {
  const [saved, setSaved] = useState<SavedQuery[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as SavedQuery[]) : []
    } catch { return [] }
  })

  const saveQuery = useCallback((name: string, query: string, dialect: string, sqlDialect: string, description?: string) => {
    if (!name.trim() || !query.trim()) return
    setSaved((prev) => {
      const existing = prev.findIndex((s) => s.name.toLowerCase() === name.trim().toLowerCase())
      const entry: SavedQuery = {
        id: genId(),
        name: name.trim(),
        query,
        dialect,
        sqlDialect,
        timestamp: Date.now(),
        description,
      }
      let next: SavedQuery[]
      if (existing >= 0) {
        next = [...prev]
        next[existing] = entry
      } else {
        next = [entry, ...prev].slice(0, MAX_SAVED)
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const deleteSaved = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.filter((s) => s.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { saved, saveQuery, deleteSaved }
}