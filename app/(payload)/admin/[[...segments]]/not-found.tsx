import type { Metadata } from 'next'

import config from '../../../../payload.config'

import {
  NotFoundPage,
  generatePageMetadata,
} from '@payloadcms/next/views'

import { importMap } from '../importMap'

type AdminParams = Promise<{
  segments: string[]
}>

type AdminSearchParams = Promise<{
  [key: string]: string | string[]
}>

type CrashDiagnostic = {
  name: string
  message: string
  stack: string[]
}

function formatCrashDiagnostic(error: unknown): CrashDiagnostic {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: (error.stack ?? '')
        .split('\n')
        .slice(0, 8)
        .map((line) => line.trim())
        .filter(Boolean),
    }
  }

  return {
    name: 'UnknownError',
    message: String(error),
    stack: [],
  }
}

function renderAdminCrashDiagnostic(error: unknown) {
  if (process.env.NODE_ENV !== 'production') {
    throw error
  }

  const diagnostic = formatCrashDiagnostic(error)

  return (
    <main
      style={{
        background: '#0f0f0f',
        color: '#f5f0e8',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        lineHeight: 1.5,
        margin: 0,
        minHeight: '100vh',
        padding: '2rem',
      }}
    >
      <p style={{ color: '#c9a962', letterSpacing: '0.08em', marginTop: 0 }}>
        TEMPORARY PAYLOAD ADMIN DIAGNOSTIC
      </p>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 1rem' }}>
        Payload Admin Crash (Not Found)
      </h1>
      <p>
        <strong>name:</strong> {diagnostic.name}
      </p>
      <p>
        <strong>message:</strong> {diagnostic.message}
      </p>
      {diagnostic.stack.length > 0 ? (
        <>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>stack:</strong>
          </p>
          <pre
            style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              overflowX: 'auto',
              padding: '1rem',
              whiteSpace: 'pre-wrap',
            }}
          >
            {diagnostic.stack.join('\n')}
          </pre>
        </>
      ) : null}
    </main>
  )
}

export const generateMetadata = ({
  params,
  searchParams,
}: {
  params: AdminParams
  searchParams: AdminSearchParams
}): Promise<Metadata> =>
  generatePageMetadata({
    config,
    params,
    searchParams,
  })

export default async function NotFound({
  params,
  searchParams,
}: {
  params: AdminParams
  searchParams: AdminSearchParams
}) {
  try {
    return await NotFoundPage({
      config,
      importMap,
      params,
      searchParams,
    })
  } catch (error) {
    console.error('[Payload Admin Crash]', error)
    return renderAdminCrashDiagnostic(error)
  }
}
