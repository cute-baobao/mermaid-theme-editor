"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, RefreshCw, Download } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEditorStore } from "@/store/editor-store"

const DIAGRAM_KEYS = ["flowchart", "sequence", "class", "gantt", "pie"] as const
type DiagramKey = (typeof DIAGRAM_KEYS)[number]

const DIAGRAM_CODES: Record<DiagramKey, string> = {
  flowchart: `graph TD
    A[Start] --> B{Condition}
    B -->|Yes| C[Action]
    B -->|No| D[Skip]
    C --> E[End]
    D --> E
    subgraph Process
        C
        D
    end`,
  sequence: `sequenceDiagram
    participant User
    participant Server
    participant DB
    User->>Server: Request
    Server->>DB: Query
    DB-->>Server: Result
    Server-->>User: Response
    Note over User,Server: HTTP/HTTPS`,
  class: `classDiagram
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
  gantt: `gantt
    title Project Plan
    dateFormat  YYYY-MM-DD
    section Design
    Analysis    :a1, 2024-01-01, 7d
    UI Design   :a2, after a1, 5d
    section Dev
    Frontend    :b1, after a2, 14d
    Backend     :b2, after a2, 14d
    section Test
    Integration :c1, after b1, 7d`,
  pie: `pie title Tech Stack
    "TypeScript" : 40
    "React" : 25
    "Node.js" : 20
    "Other" : 15`,
}

// ─── Mermaid render hook ────────────────────────────────────────────────────

interface SvgDims { w: number; h: number }

function useMermaidRender(code: string, themeVars: object, darkMode: boolean) {
  const [rendering, setRendering] = useState(false)
  const [error, setError] = useState<string>("")
  const elRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`)
  // Store natural SVG dimensions so fitToContainer doesn't need to re-call getBBox
  const svgDims = useRef<SvgDims | null>(null)
  const onRendered = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setRendering(true)
      setError("")
      svgDims.current = null
      try {
        const mermaid = (await import("mermaid")).default
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: "base",
          themeVariables: { ...themeVars, darkMode },
          flowchart: { htmlLabels: true, curve: "basis" },
        })
        idRef.current = `mermaid-${Date.now()}`
        const { svg } = await mermaid.render(idRef.current, code)
        if (elRef.current) {
          elRef.current.innerHTML = svg
          const svgEl = elRef.current.querySelector("svg")
          if (svgEl) {
            svgEl.style.maxWidth = "none"
            svgEl.style.height = "auto"
            svgEl.style.pointerEvents = "none"
            // Determine natural SVG dimensions for fitToContainer.
            // Priority: Mermaid's own viewBox → width/height attrs → getBBox (fallback).
            // getBBox() can return incorrect/partial values for Gantt & some other types,
            // so we only use it as a last resort for diagrams without a viewBox.
            requestAnimationFrame(() => {
              const vb = svgEl.viewBox.baseVal
              if (vb && vb.width > 0 && vb.height > 0) {
                // Mermaid provided a viewBox — sync width/height to match it
                svgEl.setAttribute("width", String(vb.width))
                svgEl.setAttribute("height", String(vb.height))
                svgDims.current = { w: vb.width, h: vb.height }
              } else {
                // No viewBox — try width/height attrs
                const aw = svgEl.width.baseVal.value
                const ah = svgEl.height.baseVal.value
                if (aw > 0 && ah > 0) {
                  svgDims.current = { w: aw, h: ah }
                } else {
                  // Last resort: getBBox (trims excess whitespace for simple flowcharts)
                  const bbox = svgEl.getBBox()
                  if (bbox.width && bbox.height) {
                    svgEl.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`)
                    svgEl.setAttribute("width", String(bbox.width))
                    svgEl.setAttribute("height", String(bbox.height))
                    svgDims.current = { w: bbox.width, h: bbox.height }
                  }
                }
              }
              onRendered.current?.()
            })
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Render error")
        if (elRef.current) elRef.current.innerHTML = ""
      } finally {
        setRendering(false)
      }
    }, 300)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [code, themeVars, darkMode])

  return { elRef, error, rendering, onRendered, svgDims }
}

// ─── Interactive diagram viewer ─────────────────────────────────────────────

interface DiagramViewerProps {
  code: string
  themeVars: object
  darkMode: boolean
}

function DiagramViewer({ code, themeVars, darkMode }: DiagramViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })

  const t = useTranslations("preview")
  const { elRef, error, rendering, onRendered, svgDims } = useMermaidRender(code, themeVars, darkMode)

  // Fit diagram to container — uses cached svgDims to avoid getBBox re-call issues
  // (getBBox can return wrong values for sequence diagrams on second call)
  const fitToContainer = useCallback(() => {
    if (!containerRef.current) return
    const cw = containerRef.current.clientWidth
    const ch = containerRef.current.clientHeight
    const padding = 48

    // Prefer cached dims (set right after render); fall back to live getBBox
    const dims = svgDims.current ?? (() => {
      const svgEl = elRef.current?.querySelector("svg")
      if (!svgEl) return null
      const b = svgEl.getBBox()
      return b.width && b.height ? { w: b.width, h: b.height } : null
    })()

    if (!dims) { setScale(1); setPos({ x: 0, y: 0 }); return }

    const sx = (cw - padding) / dims.w
    const sy = (ch - padding) / dims.h
    setScale(Math.min(sx, sy, 1.5))
    setPos({ x: 0, y: 0 })
  }, [elRef, svgDims])

  useEffect(() => { onRendered.current = fitToContainer }, [fitToContainer])

  const toggleFullscreen = useCallback(async () => {
    if (!rootRef.current) return
    try {
      if (!document.fullscreenElement) {
        await rootRef.current.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
      requestAnimationFrame(fitToContainer)
    }
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [fitToContainer])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.ctrlKey || e.metaKey
        ? (e.deltaY > 0 ? -0.08 : 0.08)
        : (e.deltaY > 0 ? -0.15 : 0.15)
      setScale(s => Math.max(0.1, Math.min(s + delta, 5)))
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
  }, [pos])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y })
  }, [isDragging])

  const onMouseUp = useCallback(() => setIsDragging(false), [])

  const handleExportPNG = useCallback(async () => {
    if (!elRef.current) return
    const svgEl = elRef.current.querySelector("svg")
    if (!svgEl) return
    const dims = svgDims.current
    if (!dims) return
    const pad = 40
    const dpr = 2
    const clone = svgEl.cloneNode(true) as SVGSVGElement
    clone.setAttribute("width", String(dims.w))
    clone.setAttribute("height", String(dims.h))
    const svgData = new XMLSerializer().serializeToString(clone)
    const b64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`
    const canvas = document.createElement("canvas")
    canvas.width = (dims.w + pad * 2) * dpr
    canvas.height = (dims.h + pad * 2) * dpr
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, img.width, img.height, pad * dpr, pad * dpr, dims.w * dpr, dims.h * dpr)
      canvas.toBlob(blob => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url; a.download = `mermaid-theme-${Date.now()}.png`; a.click()
        setTimeout(() => URL.revokeObjectURL(url), 100)
      }, "image/png", 1)
    }
    img.src = b64
  }, [elRef, svgDims])

  return (
    <div
      ref={rootRef}
      className="relative group h-full w-full overflow-hidden"
      style={{
        // Dot grid background
        backgroundColor: "color-mix(in srgb, hsl(var(--muted)) 30%, transparent)",
        backgroundImage: "radial-gradient(circle, color-mix(in srgb, hsl(var(--muted-foreground)) 20%, transparent) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        ...(isFullscreen ? { position: "fixed", inset: 0, zIndex: 9999, background: "white" } : {}),
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center select-none"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        {rendering && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none z-10">
            <RefreshCw className="size-4 animate-spin mr-2" />
            {t("rendering")}
          </div>
        )}
        {error && (
          <div className="absolute inset-0 p-4 text-destructive text-xs font-mono whitespace-pre-wrap overflow-auto pointer-events-none z-10">
            {error}
          </div>
        )}
        <div
          ref={elRef}
          style={{
            transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${scale})`,
            transformOrigin: "center",
            transition: isDragging ? "none" : "transform 0.05s ease-out",
          }}
        />
      </div>

      {/* Controls — appear on hover */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2 items-end pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200">
        <div className="flex flex-col rounded-lg border bg-background shadow-md overflow-hidden">
          <Button variant="ghost" size="icon" className="size-8 rounded-none border-b"
            onClick={() => setScale(s => Math.min(s + 0.25, 5))} title={t("zoomIn")}>
            <ZoomIn className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 rounded-none border-b"
            onClick={() => setScale(s => Math.max(s - 0.25, 0.1))} title={t("zoomOut")}>
            <ZoomOut className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8 rounded-none"
            onClick={fitToContainer} title={t("resetView")}>
            <RotateCcw className="size-3.5" />
          </Button>
        </div>

        <span className="text-xs text-muted-foreground bg-background/80 px-1.5 py-0.5 rounded border">
          {Math.round(scale * 100)}%
        </span>

        <div className="flex gap-1.5">
          <Button variant="outline" size="icon" className="size-8"
            onClick={toggleFullscreen} title={isFullscreen ? t("exitFullscreen") : t("fullscreen")}>
            {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </Button>
          <Button variant="default" size="sm" className="h-8 px-3 gap-1.5 text-xs"
            onClick={handleExportPNG}>
            <Download className="size-3.5" />
            {t("exportPng")}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Public panel ────────────────────────────────────────────────────────────

export function ThemePreviewPanel() {
  const [diagramType, setDiagramType] = useState<DiagramKey>("flowchart")
  const { getCurrentTheme, mode } = useEditorStore()
  const t = useTranslations("preview")

  const theme = getCurrentTheme()
  const darkMode = mode === "dark"

  const themeVars = useMemo(
    () => Object.fromEntries(Object.entries(theme).filter(([, v]) => v !== undefined)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(theme)]
  )

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-background shrink-0">
        <Select value={diagramType} onValueChange={(v) => setDiagramType(v as DiagramKey)}>
          <SelectTrigger className="h-7 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIAGRAM_KEYS.map((key) => (
              <SelectItem key={key} value={key} className="text-xs">
                {t(`diagrams.${key}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-1">{t("hint")}</span>
      </div>

      {/* Diagram viewer */}
      <div className="flex-1 overflow-hidden">
        <DiagramViewer
          code={DIAGRAM_CODES[diagramType]}
          themeVars={themeVars}
          darkMode={darkMode}
        />
      </div>
    </div>
  )
}
