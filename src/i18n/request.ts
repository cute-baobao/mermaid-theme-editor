import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"

const SUPPORTED_LOCALES = ["zh", "en"] as const
type Locale = (typeof SUPPORTED_LOCALES)[number]

function isSupported(l: string | undefined): l is Locale {
  return SUPPORTED_LOCALES.includes(l as Locale)
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const raw = cookieStore.get("locale")?.value
  const locale: Locale = isSupported(raw) ? raw : "zh"

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
