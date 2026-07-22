import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Brands } from './collections/Brands'
import { Clients } from './collections/Clients'
import { DietaryNotes } from './collections/DietaryNotes'
import { Events } from './collections/Events'
import { ExperienceBriefs } from './collections/ExperienceBriefs'
import { Experiences } from './collections/Experiences'
import { Inquiries } from './collections/Inquiries'
import { Media } from './collections/Media'
import { MenuConcepts } from './collections/MenuConcepts'
import { PackageOptions } from './collections/PackageOptions'
import { Proposals } from './collections/Proposals'
import { Tasks } from './collections/Tasks'
import { Testimonials } from './collections/Testimonials'
import { Users } from './collections/Users'
import { VendorPartners } from './collections/VendorPartners'
import { Venues } from './collections/Venues'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,

    meta: {
      titleSuffix: '· Plate The Umpqua',
      description: 'Sign in to Plate OS for Plate The Umpqua.',
      robots: 'noindex, nofollow',
      icons: [
        {
          rel: 'icon',
          type: 'image/png',
          url: '/branding/plate-the-umpqua-logo.png',
        },
      ],
      openGraph: {
        siteName: 'Plate The Umpqua',
        description: 'Sign in to Plate OS for Plate The Umpqua.',
      },
    },

    components: {
      beforeDashboard: [
        {
          path: '@/components/admin/KXDHospitalityDashboard',
        },
      ],

      beforeLogin: ['@/components/admin/login/BeforeLogin'],
      afterLogin: ['@/components/admin/login/AfterLogin'],

      graphics: {
        Logo: '@/components/admin/graphics/Logo',
        Icon: '@/components/admin/graphics/Icon',
      },

      views: {
        partners: {
          Component: '@/components/admin/PartnerConciergeDashboard',
          path: '/partners',
        },
      },
    },

    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  i18n: {
    translations: {
      en: {
        authentication: {
          login: 'Enter Plate OS',
        },
      },
    },
  },

  collections: [
    Users,
    Media,

    Brands,

    Clients,
    Inquiries,
    ExperienceBriefs,
    Experiences,

    VendorPartners,
    Venues,

    PackageOptions,
    Events,
    Proposals,
    Tasks,

    MenuConcepts,
    DietaryNotes,

    Testimonials,
  ],

  editor: lexicalEditor(),

  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),

  sharp,

  plugins: [],
})
