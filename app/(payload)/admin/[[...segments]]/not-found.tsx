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
  return NotFoundPage({
    config,
    importMap,
    params,
    searchParams,
  })
}