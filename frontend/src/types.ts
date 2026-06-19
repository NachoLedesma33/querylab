export interface ColumnSchema {
  name: string;
  type: string;
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
}

export interface QueryResponse {
  result: Record<string, unknown>[];
  tables: string[];
  columns: string[];
  rows: number;
  executionTimeMs: number;
  dialect: string;
}
