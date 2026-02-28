#!/usr/bin/env node
/**
 * Validates all community preset JSON files against the ThemePreset schema.
 * Run with: node scripts/validate-presets.mjs
 */

import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const presetsDir = join(__dirname, "../src/data/community-presets")

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/

function validateColor(value, key, file) {
  if (value === undefined) return
  if (typeof value !== "string" || !HEX_RE.test(value)) {
    throw new Error(`${file}: "${key}" must be a HEX color (e.g. #ff0000), got: ${JSON.stringify(value)}`)
  }
}

function validateThemeVars(vars, path, file) {
  const colorKeys = [
    "background", "primaryColor", "secondaryColor", "tertiaryColor",
    "primaryTextColor", "secondaryTextColor", "tertiaryTextColor",
    "textColor", "lineColor", "mainBkg",
    "primaryBorderColor", "secondaryBorderColor", "tertiaryBorderColor",
    "noteBkgColor", "noteTextColor", "noteBorderColor",
    "nodeBorder", "clusterBkg", "clusterBorder", "defaultLinkColor",
    "titleColor", "edgeLabelBackground", "nodeTextColor",
    "actorBkg", "actorBorder", "actorTextColor", "actorLineColor",
    "signalColor", "signalTextColor", "activationBkgColor",
    "errorBkgColor", "errorTextColor",
  ]
  for (const key of colorKeys) {
    if (vars[key] !== undefined) {
      validateColor(vars[key], `${path}.${key}`, file)
    }
  }
}

function validatePreset(preset, file) {
  if (!preset.id || typeof preset.id !== "string") {
    throw new Error(`${file}: "id" field is required and must be a string`)
  }
  if (!preset.name || typeof preset.name !== "string") {
    throw new Error(`${file}: "name" field is required`)
  }
  if (!preset.styles?.light || !preset.styles?.dark) {
    throw new Error(`${file}: "styles.light" and "styles.dark" are both required`)
  }
  if (preset.styles.dark.darkMode !== true) {
    throw new Error(`${file}: "styles.dark.darkMode" must be set to true`)
  }
  validateThemeVars(preset.styles.light, "styles.light", file)
  validateThemeVars(preset.styles.dark, "styles.dark", file)
}

let files
try {
  files = readdirSync(presetsDir).filter((f) => f.endsWith(".json"))
} catch {
  console.log("No community presets found, skipping validation.")
  process.exit(0)
}

const ids = new Set()
let errors = 0

for (const file of files) {
  const filePath = join(presetsDir, file)
  try {
    const content = JSON.parse(readFileSync(filePath, "utf-8"))
    validatePreset(content, file)

    if (ids.has(content.id)) {
      throw new Error(`${file}: Duplicate preset id "${content.id}"`)
    }
    ids.add(content.id)

    console.log(`✓ ${file}`)
  } catch (e) {
    console.error(`✗ ${e.message}`)
    errors++
  }
}

if (errors > 0) {
  console.error(`\n${errors} preset(s) failed validation.`)
  process.exit(1)
} else {
  console.log(`\nAll ${files.length} community preset(s) validated successfully.`)
}
