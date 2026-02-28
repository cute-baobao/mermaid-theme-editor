"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { MermaidThemeVars, ThemeMode, ThemePreset } from "@/types/theme"

const MAX_HISTORY = 50

interface EditorState {
  // Current editing state
  lightTheme: MermaidThemeVars
  darkTheme: MermaidThemeVars
  mode: ThemeMode
  currentPresetId: string | null
  showAdvanced: boolean

  // Undo/redo history (stores { light, dark } snapshots)
  history: Array<{ light: MermaidThemeVars; dark: MermaidThemeVars }>
  historyIndex: number

  // Checkpoint = state at last preset selection (for "Reset to preset")
  checkpoint: { light: MermaidThemeVars; dark: MermaidThemeVars }

  // Derived: current theme vars for the active mode
  getCurrentTheme: () => MermaidThemeVars

  // Actions
  setThemeVar: (key: keyof MermaidThemeVars, value: string | boolean) => void
  setPreset: (preset: ThemePreset) => void
  toggleMode: () => void
  undo: () => void
  redo: () => void
  resetToCheckpoint: () => void
  setShowAdvanced: (show: boolean) => void
  loadFromShare: (light: MermaidThemeVars, dark: MermaidThemeVars, mode: ThemeMode) => void
}

/** Push a new snapshot to history, truncating redo stack */
function pushHistory(
  state: EditorState,
  next: { light: MermaidThemeVars; dark: MermaidThemeVars }
) {
  const newHistory = state.history.slice(0, state.historyIndex + 1)
  newHistory.push(next)
  if (newHistory.length > MAX_HISTORY) newHistory.shift()
  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
  }
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      lightTheme: {
        background: "#ffffff",
        primaryColor: "#fff4dd",
        secondaryColor: "#f4f4f4",
        tertiaryColor: "#f4f4f4",
        primaryTextColor: "#333333",
        textColor: "#333333",
        lineColor: "#333333",
        fontFamily: "trebuchet ms, verdana, arial",
        fontSize: "16px",
        noteBkgColor: "#fff5ad",
        noteTextColor: "#333333",
      },
      darkTheme: {
        darkMode: true,
        background: "#1a1a1a",
        primaryColor: "#2d2d2d",
        secondaryColor: "#3d3d3d",
        tertiaryColor: "#3d3d3d",
        primaryTextColor: "#dddddd",
        textColor: "#dddddd",
        lineColor: "#999999",
        fontFamily: "trebuchet ms, verdana, arial",
        fontSize: "16px",
        noteBkgColor: "#404040",
        noteTextColor: "#dddddd",
      },
      mode: "light",
      currentPresetId: null,
      showAdvanced: false,

      history: [
        {
          light: {
            background: "#ffffff",
            primaryColor: "#fff4dd",
            secondaryColor: "#f4f4f4",
            tertiaryColor: "#f4f4f4",
            primaryTextColor: "#333333",
            textColor: "#333333",
            lineColor: "#333333",
            fontFamily: "trebuchet ms, verdana, arial",
            fontSize: "16px",
            noteBkgColor: "#fff5ad",
            noteTextColor: "#333333",
          },
          dark: {
            darkMode: true,
            background: "#1a1a1a",
            primaryColor: "#2d2d2d",
            secondaryColor: "#3d3d3d",
            tertiaryColor: "#3d3d3d",
            primaryTextColor: "#dddddd",
            textColor: "#dddddd",
            lineColor: "#999999",
            fontFamily: "trebuchet ms, verdana, arial",
            fontSize: "16px",
            noteBkgColor: "#404040",
            noteTextColor: "#dddddd",
          },
        },
      ],
      historyIndex: 0,

      checkpoint: {
        light: {
          background: "#ffffff",
          primaryColor: "#fff4dd",
        },
        dark: {
          darkMode: true,
          background: "#1a1a1a",
          primaryColor: "#2d2d2d",
        },
      },

      getCurrentTheme: () => {
        const { mode, lightTheme, darkTheme } = get()
        return mode === "light" ? lightTheme : darkTheme
      },

      setThemeVar: (key, value) => {
        set((state) => {
          const isLight = state.mode === "light"
          const updated = isLight
            ? { ...state.lightTheme, [key]: value }
            : { ...state.darkTheme, [key]: value }

          const next = {
            light: isLight ? updated : state.lightTheme,
            dark: isLight ? state.darkTheme : updated,
          }

          return {
            lightTheme: next.light,
            darkTheme: next.dark,
            ...pushHistory(state, next),
          }
        })
      },

      setPreset: (preset) => {
        const light = preset.styles.light
        const dark = preset.styles.dark
        set((state) => {
          const snapshot = { light, dark }
          return {
            lightTheme: light,
            darkTheme: dark,
            currentPresetId: preset.id,
            checkpoint: snapshot,
            ...pushHistory(state, snapshot),
          }
        })
      },

      toggleMode: () => {
        set((state) => ({ mode: state.mode === "light" ? "dark" : "light" }))
      },

      undo: () => {
        set((state) => {
          if (state.historyIndex <= 0) return {}
          const newIndex = state.historyIndex - 1
          const snapshot = state.history[newIndex]
          return {
            historyIndex: newIndex,
            lightTheme: snapshot.light,
            darkTheme: snapshot.dark,
          }
        })
      },

      redo: () => {
        set((state) => {
          if (state.historyIndex >= state.history.length - 1) return {}
          const newIndex = state.historyIndex + 1
          const snapshot = state.history[newIndex]
          return {
            historyIndex: newIndex,
            lightTheme: snapshot.light,
            darkTheme: snapshot.dark,
          }
        })
      },

      resetToCheckpoint: () => {
        set((state) => {
          const { checkpoint } = state
          const next = { light: checkpoint.light, dark: checkpoint.dark }
          return {
            lightTheme: checkpoint.light,
            darkTheme: checkpoint.dark,
            ...pushHistory(state, next),
          }
        })
      },

      setShowAdvanced: (show) => set({ showAdvanced: show }),

      loadFromShare: (light, dark, mode) => {
        set((state) => {
          const snapshot = { light, dark }
          return {
            lightTheme: light,
            darkTheme: dark,
            mode,
            checkpoint: snapshot,
            ...pushHistory(state, snapshot),
          }
        })
      },
    }),
    {
      name: "mermaid-theme-editor",
      partialize: (state) => ({
        lightTheme: state.lightTheme,
        darkTheme: state.darkTheme,
        mode: state.mode,
        currentPresetId: state.currentPresetId,
        showAdvanced: state.showAdvanced,
      }),
    }
  )
)
