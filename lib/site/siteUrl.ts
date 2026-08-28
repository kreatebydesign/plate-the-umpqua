/** Preferred public origin — production redirects bare domain to www. */
export const SITE_ORIGIN = 'https://www.platetheumpqua.com'

export function absoluteSiteUrl(path: string): string {
  if (path === '/' || path === '') return SITE_ORIGIN
  return `${SITE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}
