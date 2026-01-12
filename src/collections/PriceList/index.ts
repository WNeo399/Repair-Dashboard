import payload from 'payload'
import type { CollectionConfig } from 'payload'
import { anyone } from '../../access/anyone'
import { isAdmins } from '../../access/isAdmins'
import { NextResponse } from 'next/server'
import { type PriceList as PriceListType } from '@/payload-types'

export const PriceList: CollectionConfig = {
  slug: 'priceList',
  access: {
    create: isAdmins,
    delete: isAdmins,
    read: anyone,
    update: isAdmins,
  },
  admin: {
    useAsTitle: 'title',
    components: {
      beforeListTable: ['@/collections/PriceList/Buttons'],
      views: {
        list: {
          Component: '@/collections/PriceList/View',
        },
      },
    },
  },
  endpoints: [
    {
      path: '/bulkCreate',
      method: 'post',
      handler: async (req) => {
        const reader = req.body?.getReader()
        if (reader) {
          let result = ''
          const decoder = new TextDecoder()
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            result += decoder.decode(value, { stream: true })
          }
          const data = JSON.parse(result)
          data.forEach(async (each: any) => {
            await req.payload.create({
              collection: 'priceList',
              data: each,
            })
          })
          return NextResponse.json({
            message: 'success',
          })
        } else {
          return NextResponse.json({
            message: 'Miss price list data',
          })
        }
      },
    },
    {
      path: '/exportList',
      method: 'get',
      handler: async (req) => {
        const data = await req.payload.find({
          collection: 'priceList',
          limit: 999,
          overrideAccess: true,
          depth: 1,
        })
        return NextResponse.json(data)
      },
    },
    {
      path: '/updatePriceList',
      method: 'post',
      handler: async (req) => {
        const reader = req.body?.getReader()
        if (reader) {
          let result = ''
          const decoder = new TextDecoder()
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            result += decoder.decode(value, { stream: true })
          }
          const data = JSON.parse(result)
          data.forEach(async (each: PriceListType) => {
            const matches = await req.payload.find({
              collection: 'priceList',
              where: {
                brand: { equals: each.brand },
                model: { equals: each.model },
              },
            })
            if (matches.totalDocs > 0) {
              await req.payload.update({
                collection: 'priceList',
                data: {
                  priceList: each.priceList,
                },
                where: {
                  brand: { equals: each.brand },
                  model: { equals: each.model },
                },
              })
            } else {
              console.log(each)
              await req.payload.create({
                collection: 'priceList',
                data: each,
              })
            }
          })
          return NextResponse.json({
            message: 'success',
          })
        } else {
          return NextResponse.json({
            message: 'Missing Price List Data',
          })
        }
      },
    },
  ],
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'brand',
          label: 'Brand',
          type: 'relationship',
          relationTo: 'brands',
        },
        {
          name: 'model',
          label: 'Model',
          type: 'text',
        },
      ],
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'priceList',
      label: 'Price List',
      type: 'array',
      admin: {
        initCollapsed: true,
        // components: {
        //   RowLabel: ({ data, index }: RowLabelArgs) => {
        //     return `${data.title ? data.title : 'Enter a title'} ${
        //       data.price || data.price === 0 ? ` | $${data.price}` : '(Need Price)'
        //     }`
        //   },
        // },
      },
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
        },
        {
          type: 'row',
          fields: [
            {
              name: 'price',
              label: 'Price',
              type: 'number',
            },
            {
              name: 'active',
              defaultValue: false,
              label: 'Active',
              type: 'checkbox',
              admin: {
                style: {
                  alignSelf: 'flex-end',
                },
              },
            },
          ],
        },
      ],
    },
  ],
}
