import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const sharpTraceIncludes = [
  './node_modules/sharp/**/*',
  './node_modules/@img/**/*',
]

const nextConfig: NextConfig = {
  // Turbopack production builds externalize sharp via serverExternalPackages but fail to
  // include linux-x64 native binaries in Vercel serverless output. Vercel uses webpack
  // (see vercel.json) and we trace sharp explicitly for admin/API routes.
  outputFileTracingIncludes: {
    '/admin/[[...segments]]': sharpTraceIncludes,
    '/api/[...slug]': sharpTraceIncludes,
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/content/images/**',
      },
      {
        pathname: '/branding/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
