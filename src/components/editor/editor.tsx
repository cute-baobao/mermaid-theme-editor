"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEditorStore } from "@/store/editor-store"
import { parseThemeFromHash } from "@/lib/share-url"
import type { ThemePreset } from "@/types/theme"
import { Toolbar } from "./toolbar"

// Heavy components loaded dynamically to avoid bundling on initial load
const PresetPanel = dynamic(() => import("./preset-panel").then((m) => m.PresetPanel))
const ThemeControlPanel = dynamic(() => import("./theme-control-panel").then((m) => m.ThemeControlPanel))
const ThemePreviewPanel = dynamic(() => import("./theme-preview-panel").then((m) => m.ThemePreviewPanel), { ssr: false })
const CodePanel = dynamic(() => import("./code-panel").then((m) => m.CodePanel))

interface EditorProps {
  presets: ThemePreset[]
}

/** Custom resizable split pane — avoids react-resizable-panels v4 quirks */
function ResizableSplit({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  const [leftPct, setLeftPct] = useState(35)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const newPct = ((e.clientX - rect.left) / rect.width) * 100
      setLeftPct(Math.min(Math.max(newPct, 20), 70))
    }
    const onMouseUp = () => {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
    return () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }
  }, [])

  return (
    <div ref={containerRef} className="flex flex-1 overflow-hidden h-full w-full">
      {/* Left panel */}
      <div
        className="flex flex-col overflow-hidden shrink-0"
        style={{ width: `${leftPct}%` }}
      >
        {left}
      </div>

      {/* Drag handle */}
      <div
        className="relative flex items-center justify-center w-1.5 shrink-0 cursor-col-resize bg-border hover:bg-primary/30 active:bg-primary/50 transition-colors z-10 group"
        onMouseDown={onMouseDown}
      >
        {/* Visual grip dots */}
        <div className="flex flex-col gap-0.5 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-0.5 h-0.5 rounded-full bg-muted-foreground/50 group-hover:bg-primary/70 transition-colors" />
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-col overflow-hidden flex-1">
        {right}
      </div>
    </div>
  )
}

export function Editor({ presets }: EditorProps) {
  const { loadFromShare } = useEditorStore()
  const t = useTranslations("editor")

  // Restore theme from URL hash on mount
  useEffect(() => {
    const shared = parseThemeFromHash()
    if (shared) {
      loadFromShare(shared.light, shared.dark, shared.mode)
    }
  }, [loadFromShare])

  const leftContent = (
    <Tabs defaultValue="presets" className="flex flex-col h-full">
      <TabsList className="mx-3 mt-2 shrink-0">
        <TabsTrigger value="presets">{t("presets")}</TabsTrigger>
        <TabsTrigger value="edit">{t("edit")}</TabsTrigger>
        <TabsTrigger value="code">{t("export")}</TabsTrigger>
      </TabsList>
      <TabsContent value="presets" className="flex-1 overflow-hidden mt-0">
        <PresetPanel presets={presets} />
      </TabsContent>
      <TabsContent value="edit" className="flex-1 overflow-hidden mt-0">
        <ThemeControlPanel />
      </TabsContent>
      <TabsContent value="code" className="flex-1 overflow-hidden mt-0">
        <CodePanel />
      </TabsContent>
    </Tabs>
  )

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Toolbar />

      {/* Desktop: custom resizable split pane */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <ResizableSplit left={leftContent} right={<ThemePreviewPanel />} />
      </div>

      {/* Mobile: tab-based navigation */}
      <div className="flex md:hidden flex-1 overflow-hidden">
        <Tabs defaultValue="preview" className="flex flex-col w-full h-full">
          <TabsList className="mx-3 mt-2 shrink-0 grid grid-cols-4">
            <TabsTrigger value="presets">{t("presets")}</TabsTrigger>
            <TabsTrigger value="edit">{t("edit")}</TabsTrigger>
            <TabsTrigger value="preview">{t("preview")}</TabsTrigger>
            <TabsTrigger value="code">{t("export")}</TabsTrigger>
          </TabsList>
          <TabsContent value="presets" className="flex-1 overflow-hidden mt-0">
            <PresetPanel presets={presets} />
          </TabsContent>
          <TabsContent value="edit" className="flex-1 overflow-hidden mt-0">
            <ThemeControlPanel />
          </TabsContent>
          <TabsContent value="preview" className="flex-1 overflow-hidden mt-0">
            <ThemePreviewPanel />
          </TabsContent>
          <TabsContent value="code" className="flex-1 overflow-hidden mt-0">
            <CodePanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
