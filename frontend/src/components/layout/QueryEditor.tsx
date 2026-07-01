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
      run: () => {
        onExecute()
      },
    })
    editor.focus()
  }

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
    } catch {
    }
  }, [value, onChange])

  return (
    <div className="flex flex-col h-full bg-editor" role="region" aria-label="Editor de consultas SQL">
      <div className="flex items-center justify-between px-4 h-10 border-b border-border bg-muted/30 shrink-0">
        <span className="text-xs font-medium text-muted-foreground">Consulta SQL</span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground/50 mr-1 hidden sm:inline">
            Ctrl+Intro
          </span>
          <Button
            variant="sharp"
            size="icon-xs"
            onClick={handleFormat}
            disabled={!value.trim()}
            aria-label="Formatear consulta"
            title="Formatear SQL"
          >
            <Sparkles className="size-3.5" />
          </Button>
          <Button
            variant="sharp"
            size="icon-xs"
            onClick={handleReset}
            aria-label="Limpiar consulta"
            title="Limpiar consulta"
          >
            <RotateCcw className="size-3.5" />
          </Button>
          <Button
            variant="sharp-accent"
            size="xs"
            onClick={onExecute}
            disabled={loading || !value.trim()}
            aria-label="Ejecutar consulta"
          >
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
          onMount={handleMount}
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
