import type { CollectionConfig } from 'payload'
import { brandsCollectionAccess } from '@/lib/access'

export const Brands: CollectionConfig = {

  access: brandsCollectionAccess,

  slug: 'brands',
  admin: {
    useAsTitle: 'brandName',
    group: 'Platform',
    defaultColumns: ['brandName', 'brandType', 'primaryMarket', 'status'],
  },
  fields: [
    {
      name: 'brandName',
      type: 'text',
      required: true,
    },
    {
      name: 'brandSlug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Used for white-label routing and brand instance control.',
      },
    },
    {
      name: 'brandType',
      type: 'select',
      defaultValue: 'hospitalityBrand',
      options: [
        { label: 'Hospitality Brand', value: 'hospitalityBrand' },
        { label: 'Private Chef', value: 'privateChef' },
        { label: 'Winery', value: 'winery' },
        { label: 'Hotel / Resort', value: 'hotelResort' },
        { label: 'Event Company', value: 'eventCompany' },
        { label: 'Concierge Company', value: 'conciergeCompany' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'setup',
      options: [
        { label: 'Setup', value: 'setup' },
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'primaryMarket',
      type: 'text',
      defaultValue: 'Umpqua Valley',
    },
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'publicPositioning',
      type: 'textarea',
      admin: {
        description: 'Short brand positioning used across proposals and client-facing experiences.',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'brandColors',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
        },
        {
          name: 'hex',
          type: 'text',
        },
      ],
    },
    {
      name: 'systemSettings',
      type: 'group',
      fields: [
        {
          name: 'defaultMarginTarget',
          type: 'number',
          defaultValue: 35,
          admin: {
            description: 'Target profit margin percentage for generated packages.',
          },
        },
        {
          name: 'minimumDepositPercent',
          type: 'number',
          defaultValue: 50,
        },
        {
          name: 'whiteLabelEnabled',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'brandNotes',
      type: 'textarea',
    },
  ],
}