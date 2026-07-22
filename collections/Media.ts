import type { CollectionConfig } from 'payload'
import { mediaCollectionAccess } from '@/lib/access'
import { isDirector } from '@/lib/access/roles'

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024 // 25 MB

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const

export const Media: CollectionConfig = {
  slug: 'media',

  admin: {
    useAsTitle: 'alt',
    group: 'Brand & Trust',
  },

  access: mediaCollectionAccess,

  hooks: {
    beforeValidate: [
      ({ req, data, operation }) => {
        // Size / type checks apply on create when file is present on the request.
        const file = req.file
        if (operation === 'create' && file) {
          const size =
            'filesize' in file && typeof file.filesize === 'number'
              ? file.filesize
              : 'size' in file && typeof (file as { size?: number }).size === 'number'
                ? (file as { size: number }).size
                : 0

          if (size > MAX_UPLOAD_BYTES) {
            throw new Error('File exceeds the 25 MB upload limit.')
          }

          const mime =
            'mimetype' in file && typeof file.mimetype === 'string'
              ? file.mimetype
              : 'mimeType' in file && typeof (file as { mimeType?: string }).mimeType === 'string'
                ? (file as { mimeType: string }).mimeType
                : ''

          if (
            mime &&
            !ALLOWED_MIME_TYPES.includes(mime as (typeof ALLOWED_MIME_TYPES)[number])
          ) {
            throw new Error('Unsupported file type for media uploads.')
          }
        }

        if (data && !isDirector(req.user) && 'internalNotes' in data) {
          delete data.internalNotes
        }

        return data
      },
    ],
  },

  upload: {
    staticDir: 'media',

    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 400,
        fit: 'cover',
      },
      {
        name: 'card',
        width: 1200,
        height: 800,
        fit: 'cover',
      },
      {
        name: 'hero',
        width: 2000,
        height: 1200,
        fit: 'cover',
      },
    ],

    adminThumbnail: 'thumbnail',

    mimeTypes: [...ALLOWED_MIME_TYPES],
  },

  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },

    {
      name: 'mediaType',
      type: 'select',
      options: [
        {
          label: 'Food',
          value: 'food',
        },
        {
          label: 'Venue',
          value: 'venue',
        },
        {
          label: 'Experience',
          value: 'experience',
        },
        {
          label: 'Tablescape',
          value: 'tablescape',
        },
        {
          label: 'Wine',
          value: 'wine',
        },
        {
          label: 'Luxury Lifestyle',
          value: 'luxuryLifestyle',
        },
        {
          label: 'Brand',
          value: 'brand',
        },
        {
          label: 'Video',
          value: 'video',
        },
      ],
    },

    {
      name: 'photographerCredit',
      type: 'text',
    },

    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },

    {
      name: 'internalNotes',
      type: 'textarea',
      access: {
        read: ({ req }) => isDirector(req.user),
        update: ({ req }) => isDirector(req.user),
      },
    },
  ],
}
