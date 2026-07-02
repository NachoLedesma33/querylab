import { useState, useCallback } from "react"

export interface FavoriteEntry {
  query: string
  dialect: string
  sqlDialect: string
  label: string
  timestamp: number
}

const STORAGE_KEY = "querylab-favorites"
const MAX_FAVORITES = 30

export function useQueryFavorites() {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as FavoriteEntry[]) : []
    } catch {
      return []
    }
  })

  const addFavorite = useCallback((query: string, dialect: string, sqlDialect: string, label?: string) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.query === query)) return prev
      const entry: FavoriteEntry = {
        query,
        dialect,
        sqlDialect,
        label: label || query.slice(0, 40) + (query.length > 40 ? "..." : ""),
        timestamp: Date.now(),
      }
      const next = [entry, ...prev].slice(0, MAX_FAVORITES)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const removeFavorite = useCallback((query: string) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.query !== query)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isFavorite = useCallback((query: string) => {
    return favorites.some((f) => f.query === query)
  }, [favorites])

  return { favorites, addFavorite, removeFavorite, isFavorite }
}