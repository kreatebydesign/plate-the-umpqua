import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type DiagnosticError = {
  name: string
  message: string
  stack: string[]
}

type DiagnosticResult = {
  ok: boolean
  error?: DiagnosticError
}

type DiagnosticPayload = {
  generatedAt: string
  nodeEnv: string
  tests: {
    payloadConfig: DiagnosticResult
    sharp: DiagnosticResult
    importMap: DiagnosticResult
    kxdHospitalityDashboard: DiagnosticResult
    partnerConciergeDashboard: DiagnosticResult
  }
}

function formatError(error: unknown): DiagnosticError {
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

async function runImportTest(
  importer: () => Promise<unknown>,
): Promise<DiagnosticResult> {
  try {
    await importer()
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: formatError(error),
    }
  }
}

export async function GET() {
  const [payloadConfig, sharp, importMap, kxdHospitalityDashboard, partnerConciergeDashboard] =
    await Promise.all([
      runImportTest(async () => {
        await import('../../../../../payload.config')
      }),
      runImportTest(async () => {
        await import('sharp')
      }),
      runImportTest(async () => {
        await import('../../../../../app/(payload)/admin/importMap.js')
      }),
      runImportTest(async () => {
        await import('@/components/admin/KXDHospitalityDashboard')
      }),
      runImportTest(async () => {
        await import('@/components/admin/PartnerConciergeDashboard')
      }),
    ])

  const body: DiagnosticPayload = {
    generatedAt: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV ?? 'unknown',
    tests: {
      payloadConfig,
      sharp,
      importMap,
      kxdHospitalityDashboard,
      partnerConciergeDashboard,
    },
  }

  return NextResponse.json(body, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
