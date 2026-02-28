import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { Editor } from "@/components/editor/editor"
import { BUILT_IN_PRESETS, getCommunityPresets } from "@/data"
import type { ThemePreset } from "@/types/theme"

export default async function Home() {
  const t = await getTranslations("common")
  const communityPresets = await getCommunityPresets()
  const allPresets: ThemePreset[] = [...BUILT_IN_PRESETS, ...communityPresets]

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen text-muted-foreground">
          {t("loading")}
        </div>
      }
    >
      <Editor presets={allPresets} />
    </Suspense>
  )
}
