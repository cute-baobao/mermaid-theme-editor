/**
 * Mermaid themeVariables type definitions.
 * Based on official docs: https://mermaid.js.org/config/theming.html
 * Note: Only the 'base' theme supports themeVariables customization.
 * All color values must be HEX format (e.g. #ff0000), NOT CSS color names.
 */

export type MermaidThemeVars = {
  // Core - affects derived color calculation
  darkMode?: boolean
  background?: string
  primaryColor?: string
  secondaryColor?: string
  tertiaryColor?: string

  // Text & Lines
  primaryTextColor?: string
  secondaryTextColor?: string
  tertiaryTextColor?: string
  textColor?: string
  lineColor?: string
  mainBkg?: string

  // Borders (derived from primary/secondary/tertiary unless overridden)
  primaryBorderColor?: string
  secondaryBorderColor?: string
  tertiaryBorderColor?: string

  // Notes
  noteBkgColor?: string
  noteTextColor?: string
  noteBorderColor?: string

  // Typography
  fontFamily?: string
  fontSize?: string // e.g. "16px"

  // Flowchart specific
  nodeBorder?: string
  clusterBkg?: string
  clusterBorder?: string
  defaultLinkColor?: string
  titleColor?: string
  edgeLabelBackground?: string
  nodeTextColor?: string

  // Sequence diagram specific
  actorBkg?: string
  actorBorder?: string
  actorTextColor?: string
  actorLineColor?: string
  signalColor?: string
  signalTextColor?: string
  labelBoxBkgColor?: string
  labelBoxBorderColor?: string
  labelTextColor?: string
  loopTextColor?: string
  activationBorderColor?: string
  activationBkgColor?: string
  sequenceNumberColor?: string

  // Error colors
  errorBkgColor?: string
  errorTextColor?: string
}

/** A theme has both light and dark variants */
export type ThemeStyles = {
  light: MermaidThemeVars // darkMode: false (or omitted)
  dark: MermaidThemeVars // darkMode: true
}

/** A named theme preset (built-in or community) */
export type ThemePreset = {
  id: string
  name: string
  description?: string
  author?: string // community themes have an author
  tags?: string[]
  styles: ThemeStyles
}

/** Active mode */
export type ThemeMode = "light" | "dark"

/** Groups for the control panel */
export type ThemePropertyGroup = {
  id: string
  label: string
  description?: string
  properties: ThemePropertyDef[]
}

/** A single editable property */
export type ThemePropertyDef = {
  key: keyof MermaidThemeVars
  label: string
  description?: string
  type: "color" | "font-family" | "font-size" | "text" | "boolean"
  advanced?: boolean // shown in advanced mode only
}
