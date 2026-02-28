import { Suspense } from "react"
import { Editor } from "@/components/editor/editor"
import { BUILT_IN_PRESETS, getCommunityPresets } from "@/data"
import type { ThemePreset } from "@/types/theme"

// Server Component: reads preset data at request time, no client fetch needed
export default async function Home() {
  const communityPresets = await getCommunityPresets()
  const allPresets: ThemePreset[] = [...BUILT_IN_PRESETS, ...communityPresets]

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-muted-foreground">加载中...</div>}>
      <Editor presets={allPresets} />
    </Suspense>
  )
}
