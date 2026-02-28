import type { MermaidThemeVars, ThemeStyles } from "@/types/theme"

/**
 * Generates mermaid.initialize() call code.
 * Uses theme: 'base' — the only customizable Mermaid theme.
 * All color values must be HEX.
 */
export function generateInitializeCode(
  vars: MermaidThemeVars,
  darkMode: boolean
): string {
  const themeVariables = { ...vars, darkMode }
  const lines = Object.entries(themeVariables)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => {
      const value = typeof v === "boolean" ? v : `'${v}'`
      return `    ${k}: ${value},`
    })

  return `mermaid.initialize({
  securityLevel: 'loose',
  theme: 'base',
  themeVariables: {
${lines.join("\n")}
  },
});`
}

/**
 * Generates Mermaid frontmatter config block.
 * Can be prepended to a .mmd file for per-diagram theming.
 */
export function generateFrontmatterCode(
  vars: MermaidThemeVars,
  darkMode: boolean,
  diagramCode = "graph TD\n    A --> B"
): string {
  const themeVariables = { ...vars, darkMode }
  const indent = "    "
  const varLines = Object.entries(themeVariables)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${indent}  ${k}: '${v}'`)

  return `---
config:
  theme: base
  themeVariables:
${varLines.join("\n")}
---
${diagramCode}`
}

/**
 * Generates a JSON export of the theme configuration.
 */
export function generateJsonCode(
  vars: MermaidThemeVars,
  darkMode: boolean
): string {
  const themeVariables = { ...vars, darkMode }
  const filtered = Object.fromEntries(
    Object.entries(themeVariables).filter(([, v]) => v !== undefined && v !== "")
  )

  return JSON.stringify(
    {
      theme: "base",
      themeVariables: filtered,
    },
    null,
    2
  )
}

/**
 * Returns the theme variables for the given mode from a ThemeStyles object.
 */
export function getThemeVarsForMode(
  styles: ThemeStyles,
  mode: "light" | "dark"
): MermaidThemeVars {
  return styles[mode]
}
