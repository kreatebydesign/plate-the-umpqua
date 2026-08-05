import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Keep day-to-day create flows in Plate OS — not Payload Admin.
 * Admin create routes are unusable on mobile and expose storage fields.
 */
const ADMIN_CREATE_REDIRECTS: Record<string, string> = {
  '/admin/collections/invoices/create': '/os/invoices/new',
  '/admin/collections/invoices/create/': '/os/invoices/new',
  '/admin/collections/clients/create': '/os/clients/new',
  '/admin/collections/clients/create/': '/os/clients/new',
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const target = ADMIN_CREATE_REDIRECTS[pathname]
  if (target) {
    const url = request.nextUrl.clone()
    url.pathname = target
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (pathname === '/os' || pathname.startsWith('/os/')) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-os-pathname', pathname)
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/collections/invoices/create',
    '/admin/collections/invoices/create/',
    '/admin/collections/clients/create',
    '/admin/collections/clients/create/',
    '/os',
    '/os/:path*',
  ],
}
