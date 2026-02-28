"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { useTranslations } from "next-intl"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEditorStore } from "@/store/editor-store"
import {
  generateInitializeCode,
  generateFrontmatterCode,
  generateJsonCode,
} from "@/lib/theme-style-generator"

export function CodePanel() {
  const [copied, setCopied] = useState<string | null>(null)
  const { getCurrentTheme, mode } = useEditorStore()
  const t = useTranslations("code")

  const theme = getCurrentTheme()
  const darkMode = mode === "dark"

  const codes = {
    init: generateInitializeCode(theme, darkMode),
    frontmatter: generateFrontmatterCode(theme, darkMode),
    json: generateJsonCode(theme, darkMode),
  }

  const handleCopy = async (key: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // fallback
    }
  }

  const tabDesc: Record<string, string> = {
    init: t("jsInitDesc"),
    frontmatter: t("frontmatterDesc"),
    json: t("jsonDesc"),
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="init" className="flex flex-col h-full">
        <TabsList className="mx-3 mt-2 shrink-0 grid grid-cols-3">
          <TabsTrigger value="init" className="text-xs">{t("jsInit")}</TabsTrigger>
          <TabsTrigger value="frontmatter" className="text-xs">{t("frontmatter")}</TabsTrigger>
          <TabsTrigger value="json" className="text-xs">{t("json")}</TabsTrigger>
        </TabsList>

        {(["init", "frontmatter", "json"] as const).map((key) => (
          <TabsContent key={key} value={key} className="flex-1 overflow-hidden mt-0 flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b shrink-0">
              <p className="text-xs text-muted-foreground">{tabDesc[key]}</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => handleCopy(key, codes[key])}
              >
                {copied === key ? (
                  <>
                    <Check className="size-3 mr-1 text-green-500" />
                    {t("copied")}
                  </>
                ) : (
                  <>
                    <Copy className="size-3 mr-1" />
                    {t("copy")}
                  </>
                )}
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <pre className="p-3 text-xs font-mono leading-relaxed whitespace-pre-wrap break-all">
                <code>{codes[key]}</code>
              </pre>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
