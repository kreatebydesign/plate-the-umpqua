import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Keep day-to-day invoice creation in Plate OS — not Payload Admin.
 * Admin create/edit-new routes are unusable on mobile and expose storage fields.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname === '/admin/collections/invoices/create' ||
    pathname === '/admin/collections/invoices/create/'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/os/invoices/new'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/collections/invoices/create', '/admin/collections/invoices/create/'],
}
