import { useRef, useCallback, useEffect } from "react"
import Editor, { type OnMount } from "@monaco-editor/react"
import { Button } from "../ui/button"
import { Play, RotateCcw, Sparkles } from "lucide-react"
import { format } from "sql-formatter"
import { defaultSchema } from "../../schema"

interface QueryEditorProps {
  value: string
  onChange: (value: string) => void
  onExecute: () => void
  loading: boolean
  theme: "dark" | "light"
  draggedTable?: string | null
  onClearDrag?: () => void
}

const KEYWORDS = new Set([
  "SELECT", "FROM", "WHERE", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "ON",
  "AND", "OR", "NOT", "IN", "LIKE", "BETWEEN", "IS", "NULL",
  "GROUP", "BY", "HAVING", "ORDER", "ASC", "DESC",
  "LIMIT", "OFFSET", "AS", "DISTINCT", "COUNT", "SUM", "AVG", "MIN", "MAX",
  "INSERT", "UPDATE", "DELETE", "CREATE", "DROP", "ALTER", "TABLE",
  "INTO", "VALUES", "SET", "FROM", "WHERE", "UNION", "ALL", "EXISTS",
  "CASE", "WHEN", "THEN", "ELSE", "END", "CAST", "COALESCE",
])

function validateSQL(sql: string): { line: number; column: number; message: string }[] {
  const errors: { line: number; column: number; message: string }[] = []
  const trimmed = sql.trim()
  if (!trimmed) return errors

  // Check parens balance
  const lines = trimmed.split("\n")
  let parenBalance = 0
  lines.forEach((line) => {
    for (let j = 0; j < line.length; j++) {
      if (line[j] === "(") parenBalance++
      if (line[j] === ")") parenBalance--
    }
  })
  if (parenBalance > 0) {
    errors.push({ line: lines.length, column: 1, message: "Falta paréntesis de cierre )" })
  } else if (parenBalance < 0) {
    errors.push({ line: 1, column: 1, message: "Hay un paréntesis de cierre sin apertura (" })
  }

  // Check for common keyword mistakes
  const upper = trimmed.toUpperCase()
  if (upper.startsWith("SELECT") && !/\bFROM\b/i.test(trimmed)) {
    errors.push({ line: 1, column: 1, message: "Falta cláusula FROM en la consulta SELECT" })
  }

  // Flag unknown unquoted tokens (potential misspellings)
  const tokens = trimmed.split(/[\s,()]+/).filter((t) => t.length > 2)
  for (const token of tokens) {
    const upToken = token.toUpperCase()
    // Skip numbers, quoted strings, known table/column names
    if (/^\d/.test(token) || token.startsWith("'") || token.startsWith('"')) continue
    if (KEYWORDS.has(upToken)) continue

    const knownNames = new Set<string>()
    for (const table of defaultSchema) {
      knownNames.add(table.name.toUpperCase())
      for (const col of table.columns) knownNames.add(col.name.toUpperCase())
      for (const col of table.columns) knownNames.add(`${table.name}.${col.name}`.toUpperCase())
    }
    if (knownNames.has(upToken)) continue

    // Check for likely misspellings (common typos)
    const commonErrors: [string, string][] = [
      ["SELCET", "SELECT"], ["SLECT", "SELECT"], ["SELCT", "SELECT"],
      ["FOORM", "FROM"], ["FROM", "FROM"], ["FOM", "FROM"],
      ["WERE", "WHERE"], ["WHER", "WHERE"], ["WHRE", "WHERE"],
      ["JOIIN", "JOIN"], ["JOI", "JOIN"], ["JION", "JOIN"],
      ["OON", "ON"], ["NNO", "ON"],
      ["LIMT", "LIMIT"], ["LIMTI", "LIMIT"], ["LMIIT", "LIMIT"],
      ["GROPU", "GROUP"], ["GRUPO", "GROUP"], ["GRUOP", "GROUP"],
      ["ODRER", "ORDER"], ["ORER", "ORDER"], ["ORDRE", "ORDER"],
      ["DESC", "DESC"], ["ASEC", "ASC"],
      ["WHRE", "WHERE"], ["HAVNG", "HAVING"], ["HAVIG", "HAVING"],
      ["BETWEEM", "BETWEEN"], ["BETWEN", "BETWEEN"], ["BETTWEEN", "BETWEEN"],
      ["UNIOIN", "UNION"], ["UNON", "UNION"],
      ["DINSTINCT", "DISTINCT"], ["DISTICT", "DISTINCT"],
      ["CUONT", "COUNT"], ["COUN", "COUNT"],
      ["AVG", "AVG"], ["AVEG", "AVG"],
      ["SUMM", "SUM"],
      ["MAXX", "MAX"], ["MINN", "MIN"],
      ["WHEN", "WHEN"], ["TEHN", "THEN"], ["THEN", "THEN"],
      ["CASEE", "CASE"],
      ["ELS", "ELSE"],
      ["ENND", "END"], ["EN", "END"],
    ]
    for (const [wrong, correct] of commonErrors) {
      if (upToken === wrong) {
        const lineIdx = lines.findIndex((l) => l.toUpperCase().includes(wrong))
        errors.push({
          line: lineIdx + 1,
          column: (lines[lineIdx]?.indexOf(wrong) ?? 0) + 1,
          message: `¿Quisiste decir "${correct}"?`,
        })
        break
      }
    }
  }

  return errors
}

export default function QueryEditor({ value, onChange, onExecute, loading, theme, draggedTable, onClearDrag }: QueryEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)

  useEffect(() => {
    if (!draggedTable || !onClearDrag) return
    const snippet = `SELECT * FROM ${draggedTable} LIMIT 100`
    const editor = editorRef.current
    if (editor) {
      const pos = editor.getPosition() ?? { lineNumber: 1, column: 1 }
      editor.executeEdits("drag-drop", [
        { range: { startLineNumber: pos.lineNumber, startColumn: pos.column, endLineNumber: pos.lineNumber, endColumn: pos.column }, text: snippet },
      ])
      const newLine = pos.lineNumber + snippet.split("\n").length - 1
      const lastLine = snippet.split("\n").pop() ?? ""
      editor.setPosition({ lineNumber: newLine, column: lastLine.length + 1 })
      editor.focus()
    } else {
      onChange(value + (value && !value.endsWith("\n") ? "\n" : "") + snippet)
    }
    onClearDrag()
  }, [draggedTable])

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    type M = typeof monaco
    type E = M["editor"]

    monaco.languages.registerCompletionItemProvider("sql", {
      triggerCharacters: [".", " ", "(", ",", "*"],
      provideCompletionItems: (model: E["ITextModel"], position: M["Position"]) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }

        const suggestions = []
        for (const table of defaultSchema) {
          suggestions.push({
            label: table.name,
            kind: monaco.languages.CompletionItemKind.Struct,
            insertText: table.name,
            range,
            detail: `${table.columns.length} columnas`,
          })
          for (const col of table.columns) {
            suggestions.push({
              label: `${table.name}.${col.name}`,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: col.name,
              range,
              detail: `${col.type} — ${table.name}`,
            })
          }
        }
        return { suggestions }
      },
    })

    editor.addAction({
      id: "execute-query",
      label: "Ejecutar consulta",
      keybindings: [2048 | 3],
      run: () => onExecute(),
    })
    editor.focus()
  }

  // Real-time validation
  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    const monaco = (window as any).__monaco
    if (!monaco) return

    const model = editor.getModel()
    if (!model) return

    const errors = value.trim() ? validateSQL(value) : []
    monaco.editor.setModelMarkers(model, "querylab-validation", errors.map((e) => ({
      severity: monaco.MarkerSeverity.Error,
      startLineNumber: e.line,
      startColumn: e.column,
      endLineNumber: e.line,
      endColumn: (e.column || 1) + 10,
      message: e.message,
    })))
  }, [value])

  const handleReset = useCallback(() => {
    onChange("")
    editorRef.current?.setValue("")
    editorRef.current?.focus()
  }, [onChange])

  const handleFormat = useCallback(() => {
    try {
      const formatted = format(value, { language: "sql" })
      onChange(formatted)
      editorRef.current?.setValue(formatted)
    } catch {}
  }, [value, onChange])

  return (
    <div className="flex flex-col h-full bg-editor" role="region" aria-label="Editor de consultas SQL">
      <div className="flex items-center justify-between px-4 h-10 border-b border-border bg-muted/30 shrink-0">
        <span className="text-xs font-medium text-muted-foreground">Consulta SQL</span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground/50 mr-1 hidden sm:inline">Ctrl+Intro</span>
          <Button variant="sharp" size="icon-xs" onClick={handleFormat} disabled={!value.trim()} aria-label="Formatear consulta" title="Formatear SQL">
            <Sparkles className="size-3.5" />
          </Button>
          <Button variant="sharp" size="icon-xs" onClick={handleReset} aria-label="Limpiar consulta" title="Limpiar consulta">
            <RotateCcw className="size-3.5" />
          </Button>
          <Button variant="sharp-accent" size="xs" onClick={onExecute} disabled={loading || !value.trim()} aria-label="Ejecutar consulta">
            <Play className="size-3.5" />
            Ejecutar
          </Button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme={theme === "dark" ? "vs-dark" : "light"}
          value={value}
          onChange={(v) => onChange(v ?? "")}
          onMount={(editor, monaco) => {
            ;(window as any).__monaco = monaco
            handleMount(editor, monaco)
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            padding: { top: 8 },
            suggest: { showKeywords: true },
          }}
        />
      </div>
    </div>
  )
}