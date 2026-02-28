"use client"

import { useState, useMemo } from "react"
import { Search, Shuffle, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEditorStore } from "@/store/editor-store"
import type { ThemePreset } from "@/types/theme"
import { cn } from "@/lib/utils"

interface PresetPanelProps {
  presets: ThemePreset[]
}

export function PresetPanel({ presets }: PresetPanelProps) {
  const [search, setSearch] = useState("")
  const { currentPresetId, setPreset } = useEditorStore()

  const filtered = useMemo(() => {
    if (!search.trim()) return presets
    const q = search.toLowerCase()
    return presets.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    )
  }, [presets, search])

  // Group by author: built-in (no author) vs community (has author)
  const builtIn = filtered.filter((p) => !p.author)
  const community = filtered.filter((p) => !!p.author)

  const handleRandom = () => {
    const idx = Math.floor(Math.random() * presets.length)
    setPreset(presets[idx])
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search + Random */}
      <div className="flex gap-2 p-3 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="搜索预设..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <Button variant="outline" size="icon" className="size-8 shrink-0" onClick={handleRandom}>
          <Shuffle className="size-3.5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-3 pb-4 space-y-4">
          {/* Built-in presets */}
          {builtIn.length > 0 && (
            <section>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                内置主题
              </h3>
              <div className="space-y-1">
                {builtIn.map((preset) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    isActive={preset.id === currentPresetId}
                    onSelect={() => setPreset(preset)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Community presets */}
          {community.length > 0 && (
            <section>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                社区主题
              </h3>
              <div className="space-y-1">
                {community.map((preset) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    isActive={preset.id === currentPresetId}
                    onSelect={() => setPreset(preset)}
                  />
                ))}
              </div>
            </section>
          )}

          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              没有找到匹配的主题
            </p>
          )}

          {/* Contribute CTA */}
          <a
            href="https://github.com/your-repo/mermaid-theme-editor/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 rounded-lg border border-dashed text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors"
          >
            <span className="flex-1">提交你的主题 →</span>
            <ChevronRight className="size-4" />
          </a>
        </div>
      </ScrollArea>
    </div>
  )
}

function PresetCard({
  preset,
  isActive,
  onSelect,
}: {
  preset: ThemePreset
  isActive: boolean
  onSelect: () => void
}) {
  const lightBg = preset.styles.light.background ?? "#f4f4f4"
  const lightPrimary = preset.styles.light.primaryColor ?? "#fff4dd"
  const lightLine = preset.styles.light.lineColor ?? "#333333"

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-colors",
        isActive
          ? "border-primary bg-primary/5"
          : "border-transparent hover:border-border hover:bg-muted/50"
      )}
    >
      {/* Color swatch preview */}
      <div
        className="size-10 rounded shrink-0 border overflow-hidden grid grid-cols-2 grid-rows-2"
        style={{ backgroundColor: lightBg }}
      >
        <div style={{ backgroundColor: lightPrimary }} />
        <div style={{ backgroundColor: lightLine }} />
        <div style={{ backgroundColor: preset.styles.dark.primaryColor ?? "#2d2d2d" }} />
        <div style={{ backgroundColor: preset.styles.dark.background ?? "#1a1a1a" }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{preset.name}</span>
          {isActive && (
            <Badge variant="secondary" className="text-xs h-4 px-1">
              当前
            </Badge>
          )}
        </div>
        {preset.description && (
          <p className="text-xs text-muted-foreground truncate">{preset.description}</p>
        )}
        {preset.author && (
          <p className="text-xs text-muted-foreground">by {preset.author}</p>
        )}
      </div>
    </button>
  )
}
