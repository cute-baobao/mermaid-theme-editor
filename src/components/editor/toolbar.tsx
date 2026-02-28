"use client"

import { useCallback, useTransition } from "react"
import { Undo2, Redo2, RotateCcw, Share2, Sun, Moon, Palette, Languages } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useEditorStore } from "@/store/editor-store"
import { buildShareUrl } from "@/lib/share-url"
import { setLocale } from "@/actions/locale"

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

  const t = useTranslations("toolbar")
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const handleShare = useCallback(async () => {
    const url = buildShareUrl({ light: lightTheme, dark: darkTheme, mode })
    try {
      await navigator.clipboard.writeText(url)
      alert(t("shareSuccess"))
    } catch {
      prompt(t("sharePrompt"), url)
    }
  }, [lightTheme, darkTheme, mode, t])

  const handleLocaleSwitch = () => {
    const next = locale === "zh" ? "en" : "zh"
    startTransition(() => {
      setLocale(next)
    })
  }

  return (
    <header className="flex items-center gap-2 px-4 py-2 border-b bg-background shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <Palette className="size-5 text-primary" />
        <span className="font-semibold text-sm hidden sm:block">{t("title")}</span>
      </div>

      <Separator orientation="vertical" className="h-5" />

      {/* Undo / Redo */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} className="size-8">
            <Undo2 className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("undo")}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} className="size-8">
            <Redo2 className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("redo")}</TooltipContent>
      </Tooltip>

      {/* Reset */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={resetToCheckpoint} className="size-8">
            <RotateCcw className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("reset")}</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-5" />

      {/* Light/Dark toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={toggleMode} className="size-8">
            {mode === "light" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {mode === "light" ? t("switchToDark") : t("switchToLight")}
        </TooltipContent>
      </Tooltip>

      {/* Share */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleShare} className="size-8">
            <Share2 className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("share")}</TooltipContent>
      </Tooltip>

      {/* Language switcher */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLocaleSwitch}
            disabled={isPending}
            className="h-8 px-2 text-xs font-medium gap-1"
          >
            <Languages className="size-3.5" />
            {locale === "zh" ? "EN" : "中文"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{locale === "zh" ? "Switch to English" : "切换中文"}</TooltipContent>
      </Tooltip>

      {/* Mode indicator */}
      <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
        <div
          className={`size-2 rounded-full ${mode === "light" ? "bg-yellow-400" : "bg-blue-400"}`}
        />
        {mode === "light" ? t("lightMode") : t("darkMode")}
      </div>
    </header>
  )
}
