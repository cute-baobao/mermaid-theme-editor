"use client"

import { useCallback } from "react"
import { Undo2, Redo2, RotateCcw, Share2, Sun, Moon, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useEditorStore } from "@/store/editor-store"
import { buildShareUrl } from "@/lib/share-url"

export function Toolbar() {
  const {
    mode,
    historyIndex,
    history,
    toggleMode,
    undo,
    redo,
    resetToCheckpoint,
    lightTheme,
    darkTheme,
  } = useEditorStore()

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const handleShare = useCallback(async () => {
    const url = buildShareUrl({ light: lightTheme, dark: darkTheme, mode })
    try {
      await navigator.clipboard.writeText(url)
      // Simple feedback - could use toast library
      alert("分享链接已复制到剪贴板！")
    } catch {
      prompt("复制以下链接分享你的主题：", url)
    }
  }, [lightTheme, darkTheme, mode])

  return (
    <header className="flex items-center gap-2 px-4 py-2 border-b bg-background shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <Palette className="size-5 text-primary" />
        <span className="font-semibold text-sm hidden sm:block">Mermaid Theme Editor</span>
      </div>

      <Separator orientation="vertical" className="h-5" />

      {/* Undo / Redo */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={!canUndo}
            className="size-8"
          >
            <Undo2 className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>撤销 (Ctrl+Z)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={!canRedo}
            className="size-8"
          >
            <Redo2 className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>重做 (Ctrl+Y)</TooltipContent>
      </Tooltip>

      {/* Reset */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={resetToCheckpoint}
            className="size-8"
          >
            <RotateCcw className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>重置到当前预设</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-5" />

      {/* Light/Dark toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMode}
            className="size-8"
          >
            {mode === "light" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          切换到{mode === "light" ? "暗色" : "亮色"}模式
        </TooltipContent>
      </Tooltip>

      {/* Share */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="size-8"
          >
            <Share2 className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>复制分享链接</TooltipContent>
      </Tooltip>

      {/* Mode indicator */}
      <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
        <div
          className={`size-2 rounded-full ${
            mode === "light" ? "bg-yellow-400" : "bg-blue-400"
          }`}
        />
        {mode === "light" ? "亮色模式" : "暗色模式"}
      </div>
    </header>
  )
}
