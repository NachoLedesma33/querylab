import type { TableSchema } from "./types"

export const defaultSchema: TableSchema[] = [
  {
    name: "movies",
    columns: [
      { name: "id", type: "BIGINT" },
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
      { name: "id", type: "BIGINT" },
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
      { name: "id", type: "BIGINT" },
      { name: "user_id", type: "BIGINT" },
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
      { name: "id", type: "BIGINT" },
      { name: "user_id", type: "BIGINT" },
      { name: "movie_id", type: "BIGINT" },
      { name: "watched_at", type: "TIMESTAMP" },
      { name: "progress_seconds", type: "INT" },
      { name: "completed", type: "BOOLEAN" },
    ],
  },
  {
    name: "directors",
    columns: [
      { name: "id", type: "BIGINT" },
      { name: "name", type: "VARCHAR(255)" },
      { name: "birth_date", type: "DATE" },
      { name: "nationality", type: "VARCHAR(100)" },
      { name: "awards", type: "INT" },
    ],
  },
  {
    name: "actors",
    columns: [
      { name: "id", type: "BIGINT" },
      { name: "name", type: "VARCHAR(255)" },
      { name: "birth_date", type: "DATE" },
      { name: "nationality", type: "VARCHAR(100)" },
      { name: "active", type: "BOOLEAN" },
    ],
  },
  {
    name: "movie_actors",
    columns: [
      { name: "id", type: "BIGINT" },
      { name: "movie_id", type: "BIGINT" },
      { name: "actor_id", type: "BIGINT" },
      { name: "role", type: "VARCHAR(100)" },
    ],
  },
  {
    name: "reviews",
    columns: [
      { name: "id", type: "BIGINT" },
      { name: "user_id", type: "BIGINT" },
      { name: "movie_id", type: "BIGINT" },
      { name: "rating", type: "INT" },
      { name: "comment", type: "TEXT" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "playlists",
    columns: [
      { name: "id", type: "BIGINT" },
      { name: "user_id", type: "BIGINT" },
      { name: "name", type: "VARCHAR(255)" },
      { name: "description", type: "TEXT" },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "is_public", type: "BOOLEAN" },
    ],
  },
  {
    name: "playlist_items",
    columns: [
      { name: "id", type: "BIGINT" },
      { name: "playlist_id", type: "BIGINT" },
      { name: "movie_id", type: "BIGINT" },
      { name: "added_at", type: "TIMESTAMP" },
      { name: "position", type: "INT" },
    ],
  },
  {
    name: "genres",
    columns: [
      { name: "id", type: "BIGINT" },
      { name: "name", type: "VARCHAR(100)" },
      { name: "description", type: "TEXT" },
    ],
  },
  {
    name: "payments",
    columns: [
      { name: "id", type: "BIGINT" },
      { name: "user_id", type: "BIGINT" },
      { name: "amount", type: "DECIMAL(10,2)" },
      { name: "payment_date", type: "TIMESTAMP" },
      { name: "method", type: "VARCHAR(50)" },
      { name: "status", type: "VARCHAR(20)" },
    ],
  },
  {
    name: "notifications",
    columns: [
      { name: "id", type: "BIGINT" },
      { name: "user_id", type: "BIGINT" },
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
      { name: "id", type: "BIGINT" },
      { name: "user_id", type: "BIGINT" },
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
      { name: "id", type: "BIGINT" },
      { name: "user_id", type: "BIGINT" },
      { name: "name", type: "VARCHAR(255)" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "watchlist_items",
    columns: [
      { name: "id", type: "BIGINT" },
      { name: "watchlist_id", type: "BIGINT" },
      { name: "movie_id", type: "BIGINT" },
      { name: "added_at", type: "TIMESTAMP" },
      { name: "priority", type: "INT" },
    ],
  },
]
