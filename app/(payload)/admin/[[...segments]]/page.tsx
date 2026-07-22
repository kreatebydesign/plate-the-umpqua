import type { Metadata } from 'next'

import config from '../../../../payload.config'

import {
  RootPage,
  generatePageMetadata,
} from '@payloadcms/next/views'

import { importMap } from '../importMap'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = async ({
  params,
  searchParams,
}: Args): Promise<Metadata> => {
  const resolvedParams = await params
  const meta = await generatePageMetadata({
    config,
    params,
    searchParams,
  })

  const isLogin = resolvedParams.segments?.[0] === 'login'

  if (!isLogin) {
    return meta
  }

  return {
    ...meta,
    title: {
      absolute: 'Sign In | Plate The Umpqua',
    },
    description:
      'Sign in to manage Plate operations, inquiries, events, and client relationships.',
    robots: {
      index: false,
      follow: false,
    },
  }
}

const Page = ({ params, searchParams }: Args) =>
  RootPage({
    config,
    params,
    searchParams,
    importMap,
  })

export default Page
