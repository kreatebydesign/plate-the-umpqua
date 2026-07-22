import type { CollectionConfig } from 'payload'
import { tasksCollectionAccess } from '@/lib/access'

export const Tasks: CollectionConfig = {

  access: tasksCollectionAccess,

  slug: 'tasks',

  admin: {
    useAsTitle: 'taskTitle',

    group: 'Operations',

    defaultColumns: [
      'taskTitle',
      'brand',
      'relatedExperience',
      'assignedTo',
      'dueDate',
      'status',
      'priority',
    ],
  },

  fields: [
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
      required: true,
    },

    {
      name: 'taskTitle',
      type: 'text',
      required: true,
    },

    {
      name: 'status',
      type: 'select',

      defaultValue: 'open',

      options: [
        { label: 'Open', value: 'open' },
        { label: 'In Progress', value: 'inProgress' },
        { label: 'Waiting', value: 'waiting' },
        { label: 'Blocked', value: 'blocked' },
        { label: 'Complete', value: 'complete' },
      ],
    },

    {
      name: 'priority',
      type: 'select',

      defaultValue: 'normal',

      options: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' },
      ],
    },

    {
      name: 'taskType',
      type: 'select',

      options: [
        { label: 'Discovery Call', value: 'discoveryCall' },
        { label: 'Client Follow-Up', value: 'clientFollowUp' },
        { label: 'Venue Research', value: 'venueResearch' },
        { label: 'Venue Outreach', value: 'venueOutreach' },
        { label: 'Vendor Sourcing', value: 'vendorSourcing' },
        { label: 'Vendor Outreach', value: 'vendorOutreach' },
        { label: 'Menu Development', value: 'menuDevelopment' },
        { label: 'Experience Design', value: 'experienceDesign' },
        { label: 'Package Building', value: 'packageBuilding' },
        { label: 'Proposal Prep', value: 'proposalPrep' },
        { label: 'Deposit Collection', value: 'depositCollection' },
        { label: 'Event Prep', value: 'eventPrep' },
        { label: 'Day-of Coordination', value: 'dayOfCoordination' },
        { label: 'Post-Event Follow-Up', value: 'postEventFollowUp' },
        { label: 'Testimonial Request', value: 'testimonialRequest' },
        { label: 'Automation Review', value: 'automationReview' },
      ],
    },

    {
      name: 'relatedClient',
      type: 'relationship',
      relationTo: 'clients',
    },

    {
      name: 'relatedInquiry',
      type: 'relationship',
      relationTo: 'inquiries',
    },

    {
      name: 'relatedExperience',
      type: 'relationship',
      relationTo: 'experiences',
    },

    {
      name: 'relatedEvent',
      type: 'relationship',
      relationTo: 'events',
    },

    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
    },

    {
      name: 'dueDate',
      type: 'date',
    },

    {
      name: 'automationEligible',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Marks whether this task can later be automated by the system.',
      },
    },

    {
      name: 'generatedBySystem',
      type: 'checkbox',
      defaultValue: false,
    },

    {
      name: 'estimatedRevenueImpact',
      type: 'number',
    },

    {
      name: 'notes',
      type: 'textarea',
    },

    {
      name: 'internalOperationsNotes',
      type: 'textarea',
    },
  ],
}