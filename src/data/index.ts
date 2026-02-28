import type { ThemePreset } from "@/types/theme"
import defaultPreset from "./presets/default.json"
import forestPreset from "./presets/forest.json"
import neutralPreset from "./presets/neutral.json"
import oceanPreset from "./presets/ocean.json"
import sunsetPreset from "./presets/sunset.json"

export const BUILT_IN_PRESETS: ThemePreset[] = [
  defaultPreset as ThemePreset,
  forestPreset as ThemePreset,
  neutralPreset as ThemePreset,
  oceanPreset as ThemePreset,
  sunsetPreset as ThemePreset,
]

/**
 * Load community presets from JSON files — runs on the server at build/request time.
 * Uses dynamic require to read files from the community-presets directory.
 */
export async function getCommunityPresets(): Promise<ThemePreset[]> {
  // Server-side only: use Node.js fs to read community preset JSON files
  const { readdir, readFile } = await import("fs/promises")
  const { join } = await import("path")

  const dir = join(process.cwd(), "src/data/community-presets")

  let files: string[]
  try {
    files = await readdir(dir)
  } catch {
    return []
  }

  const presets: ThemePreset[] = []
  for (const file of files) {
    if (!file.endsWith(".json")) continue
    try {
      const content = await readFile(join(dir, file), "utf-8")
      presets.push(JSON.parse(content) as ThemePreset)
    } catch {
      // Skip malformed files
    }
  }

  return presets
}
