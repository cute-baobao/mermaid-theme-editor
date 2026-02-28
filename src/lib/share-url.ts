import LZString from "lz-string"
import type { MermaidThemeVars, ThemeMode } from "@/types/theme"

interface ShareableState {
  light: MermaidThemeVars
  dark: MermaidThemeVars
  mode: ThemeMode
}

/** Encodes theme state into a URL-safe base64 string */
export function encodeThemeToUrl(state: ShareableState): string {
  const json = JSON.stringify(state)
  return LZString.compressToEncodedURIComponent(json)
}

/** Decodes a URL-safe base64 string back to theme state */
export function decodeThemeFromUrl(encoded: string): ShareableState | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded)
    if (!json) return null
    return JSON.parse(json) as ShareableState
  } catch {
    return null
  }
}

/** Builds the full shareable URL */
export function buildShareUrl(state: ShareableState): string {
  const encoded = encodeThemeToUrl(state)
  const base =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}`
      : ""
  return `${base}#theme=${encoded}`
}

/** Parses theme state from the current URL hash */
export function parseThemeFromHash(): ShareableState | null {
  if (typeof window === "undefined") return null
  const hash = window.location.hash
  const match = hash.match(/[#&]theme=([^&]*)/)
  if (!match) return null
  return decodeThemeFromUrl(match[1])
}
