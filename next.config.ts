import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/": ["./src/data/community-presets/*.json"],
  },
}

export default withNextIntl(nextConfig)
