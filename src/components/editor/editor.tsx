"use client"

import dynamic from "next/dynamic"
import { useEffect } from "react"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
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

export function Editor({ presets }: EditorProps) {
  const { loadFromShare } = useEditorStore()

  // Restore theme from URL hash on mount
  useEffect(() => {
    const shared = parseThemeFromHash()
    if (shared) {
      loadFromShare(shared.light, shared.dark, shared.mode)
    }
  }, [loadFromShare])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Toolbar />

      {/* Desktop: resizable left/right panels */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <ResizablePanelGroup orientation="horizontal" className="flex-1">
          {/* Left: control panels */}
          <ResizablePanel defaultSize={35} minSize={25} maxSize={55}>
            <div className="flex flex-col h-full overflow-hidden">
              <Tabs defaultValue="presets" className="flex flex-col h-full">
                <TabsList className="mx-3 mt-2 shrink-0">
                  <TabsTrigger value="presets">预设</TabsTrigger>
                  <TabsTrigger value="edit">编辑</TabsTrigger>
                  <TabsTrigger value="code">导出</TabsTrigger>
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
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right: preview */}
          <ResizablePanel defaultSize={65} minSize={40}>
            <ThemePreviewPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile: tab-based navigation */}
      <div className="flex md:hidden flex-1 overflow-hidden">
        <Tabs defaultValue="preview" className="flex flex-col w-full h-full">
          <TabsList className="mx-3 mt-2 shrink-0 grid grid-cols-4">
            <TabsTrigger value="presets">预设</TabsTrigger>
            <TabsTrigger value="edit">编辑</TabsTrigger>
            <TabsTrigger value="preview">预览</TabsTrigger>
            <TabsTrigger value="code">导出</TabsTrigger>
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
