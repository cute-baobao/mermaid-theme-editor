"use client"

import { useState } from "react"
import { HexColorPicker } from "react-colorful"
import { useTranslations } from "next-intl"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { useEditorStore } from "@/store/editor-store"
import { THEME_PROPERTY_GROUPS, FONT_FAMILY_OPTIONS } from "@/lib/mermaid-theme"
import type { ThemePropertyDef, MermaidThemeVars } from "@/types/theme"
import { cn } from "@/lib/utils"

export function ThemeControlPanel() {
  const { getCurrentTheme, setThemeVar, showAdvanced, setShowAdvanced } =
    useEditorStore()
  const theme = getCurrentTheme()
  const t = useTranslations("control")

  const visibleGroups = THEME_PROPERTY_GROUPS.map((group) => ({
    ...group,
    properties: group.properties.filter((p) => showAdvanced || !p.advanced),
  })).filter((g) => g.properties.length > 0)

  return (
    <div className="flex flex-col h-full">
      {/* Advanced toggle */}
      <div className="flex items-center justify-between px-3 py-2 border-b shrink-0">
        <span className="text-xs text-muted-foreground">{t("showAdvanced")}</span>
        <Switch
          checked={showAdvanced}
          onCheckedChange={setShowAdvanced}
          className="scale-90"
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          <Accordion type="multiple" defaultValue={["core", "text-lines", "typography"]}>
            {visibleGroups.map((group) => (
              <AccordionItem key={group.id} value={group.id} className="border-b">
                <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span>{t(`groups.${group.id}`)}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      ({group.properties.length})
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <div className="space-y-3">
                    {group.properties.map((prop) => (
                      <PropertyControl
                        key={prop.key}
                        prop={prop}
                        label={t(`props.${prop.key}`)}
                        value={theme[prop.key]}
                        onChange={(val) => setThemeVar(prop.key, val)}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  )
}

interface PropertyControlProps {
  prop: ThemePropertyDef
  label: string
  value: MermaidThemeVars[keyof MermaidThemeVars]
  onChange: (val: string | boolean) => void
}

function PropertyControl({ prop, label, value, onChange }: PropertyControlProps) {
  const strValue = value !== undefined ? String(value) : ""

  if (prop.type === "color") {
    return <ColorControl prop={prop} label={label} value={strValue} onChange={onChange} />
  }

  if (prop.type === "font-family") {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs">{label}</Label>
        <Select value={strValue} onValueChange={onChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  if (prop.type === "font-size") {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs">{label}</Label>
        <Input
          value={strValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="16px"
          className="h-8 text-xs"
        />
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        value={strValue}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-xs"
      />
    </div>
  )
}

function ColorControl({
  prop,
  label,
  value,
  onChange,
}: {
  prop: ThemePropertyDef
  label: string
  value: string
  onChange: (val: string) => void
}) {
  const [localHex, setLocalHex] = useState(value || "#ffffff")

  const handleChange = (hex: string) => {
    setLocalHex(hex)
    onChange(hex)
  }

  const handleInputChange = (raw: string) => {
    setLocalHex(raw)
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
      onChange(raw)
    }
  }

  const displayColor = /^#[0-9a-fA-F]{3,6}$/.test(value) ? value : "#ffffff"

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "size-7 rounded border-2 border-border shrink-0 cursor-pointer",
              "hover:border-primary transition-colors"
            )}
            style={{ backgroundColor: displayColor }}
            title={label}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-2">
            <p className="text-xs font-medium">{label}</p>
            {prop.description && (
              <p className="text-xs text-muted-foreground max-w-48">{prop.description}</p>
            )}
            <HexColorPicker
              color={displayColor}
              onChange={handleChange}
              style={{ width: "200px" }}
            />
            <Input
              value={localHex}
              onChange={(e) => handleInputChange(e.target.value)}
              className="h-7 text-xs font-mono"
              placeholder="#000000"
            />
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex-1 min-w-0">
        <Label className="text-xs truncate block">{label}</Label>
        <Input
          value={value || ""}
          onChange={(e) => {
            setLocalHex(e.target.value)
            handleInputChange(e.target.value)
          }}
          className="h-6 text-xs font-mono mt-0.5"
          placeholder="#000000"
        />
      </div>
    </div>
  )
}

