import { useRef, useCallback } from "react"
import Editor, { type OnMount } from "@monaco-editor/react"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw } from "lucide-react"

interface QueryEditorProps {
  value: string
  onChange: (value: string) => void
  onExecute: () => void
  loading: boolean
}

export function QueryEditor({ value, onChange, onExecute, loading }: QueryEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor
    editor.addAction({
      id: "execute-query",
      label: "Execute Query",
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

  return (
    <div className="flex flex-col h-full bg-editor" role="region" aria-label="SQL query editor">
      <div className="flex items-center justify-between px-4 h-10 border-b border-border bg-muted/30 shrink-0">
        <span className="text-xs font-medium text-muted-foreground">SQL Query</span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground mr-1 hidden sm:inline">
            Ctrl+Enter
          </span>
          <Button
            variant="ghost"
            size="xs"
            onClick={handleReset}
            aria-label="Clear query"
          >
            <RotateCcw className="size-3.5" />
          </Button>
          <Button
            size="xs"
            onClick={onExecute}
            disabled={loading || !value.trim()}
            aria-label="Execute query"
          >
            <Play className="size-3.5" />
            Run
          </Button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme="vs-dark"
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
