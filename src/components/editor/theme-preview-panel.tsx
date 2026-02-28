"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Maximize2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEditorStore } from "@/store/editor-store"

const DIAGRAM_SAMPLES: Record<string, { label: string; code: string }> = {
  flowchart: {
    label: "流程图",
    code: `graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作]
    B -->|否| D[跳过]
    C --> E[结束]
    D --> E
    subgraph 处理流程
        C
        D
    end`,
  },
  sequence: {
    label: "时序图",
    code: `sequenceDiagram
    participant 用户
    participant 服务器
    participant 数据库
    用户->>服务器: 发送请求
    服务器->>数据库: 查询数据
    数据库-->>服务器: 返回结果
    服务器-->>用户: 响应数据
    Note over 用户,服务器: HTTP/HTTPS`,
  },
  class: {
    label: "类图",
    code: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +fetch()
    }
    class Cat {
        +purr()
    }
    Animal <|-- Dog
    Animal <|-- Cat`,
  },
  gantt: {
    label: "甘特图",
    code: `gantt
    title 项目开发计划
    dateFormat  YYYY-MM-DD
    section 设计阶段
    需求分析    :a1, 2024-01-01, 7d
    UI设计      :a2, after a1, 5d
    section 开发阶段
    前端开发    :b1, after a2, 14d
    后端开发    :b2, after a2, 14d
    section 测试阶段
    集成测试    :c1, after b1, 7d`,
  },
  pie: {
    label: "饼图",
    code: `pie title 技术栈分布
    "TypeScript" : 40
    "React" : 25
    "Node.js" : 20
    "其他" : 15`,
  },
}

function useMermaidRender(code: string, themeVars: object, darkMode: boolean) {
  const [svg, setSvg] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [rendering, setRendering] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setRendering(true)
      setError("")
      try {
        const mermaid = (await import("mermaid")).default
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: "base",
          themeVariables: { ...themeVars, darkMode },
        })
        const id = `mermaid-${Date.now()}`
        const { svg: rendered } = await mermaid.render(id, code)
        setSvg(rendered)
      } catch (e) {
        setError(e instanceof Error ? e.message : "渲染失败")
      } finally {
        setRendering(false)
      }
    }, 300)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [code, themeVars, darkMode])

  return { svg, error, rendering }
}

function MermaidPreview({
  code,
  themeVars,
  darkMode,
}: {
  code: string
  themeVars: object
  darkMode: boolean
}) {
  const { svg, error, rendering } = useMermaidRender(code, themeVars, darkMode)

  if (rendering) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <RefreshCw className="size-4 animate-spin mr-2" />
        渲染中...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-destructive text-sm font-mono whitespace-pre-wrap">
        {error}
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-center w-full h-full p-4 overflow-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

export function ThemePreviewPanel() {
  const [diagramType, setDiagramType] = useState("flowchart")
  const [fullscreen, setFullscreen] = useState(false)
  const { getCurrentTheme, mode } = useEditorStore()

  const theme = getCurrentTheme()
  const darkMode = mode === "dark"
  const diagram = DIAGRAM_SAMPLES[diagramType]

  // Extract serializable theme vars (no functions)
  const themeVars = Object.fromEntries(
    Object.entries(theme).filter(([, v]) => v !== undefined)
  )

  return (
    <div className="flex flex-col h-full bg-muted/20">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-background shrink-0">
        <Select value={diagramType} onValueChange={setDiagramType}>
          <SelectTrigger className="h-7 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DIAGRAM_SAMPLES).map(([key, { label }]) => (
              <SelectItem key={key} value={key} className="text-xs">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => setFullscreen(true)}
          >
            <Maximize2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-hidden">
        <MermaidPreview
          code={diagram.code}
          themeVars={themeVars}
          darkMode={darkMode}
        />
      </div>

      {/* Fullscreen dialog */}
      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>预览 — {diagram.label}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <MermaidPreview
              code={diagram.code}
              themeVars={themeVars}
              darkMode={darkMode}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
