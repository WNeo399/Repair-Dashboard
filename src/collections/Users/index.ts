import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { fIsAdmins } from '@/access/fieldAccess/fIsAdmins'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['user'],
      options: [
        {
          label: 'admin',
          value: 'admin',
        },
        {
          label: 'employee',
          value: 'employee',
        },
        {
          label: 'user',
          value: 'user',
        },
      ],
      // hooks: {
      //   beforeChange: [ensureFirstUserIsAdmin],
      // },
      access: {
        read: fIsAdmins,
        create: fIsAdmins,
        update: fIsAdmins,
      },
    },
  ],
  timestamps: true,
}
