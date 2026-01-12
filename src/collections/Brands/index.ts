import type { CollectionConfig } from 'payload'
import { anyone } from '../../access/anyone'
import { isAdmins } from '../../access/isAdmins'
import { NextResponse } from 'next/server'

const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title'],
  },
  access: {
    read: anyone,
    update: isAdmins,
    create: isAdmins,
    delete: isAdmins,
  },
  endpoints: [
    {
      method: 'post',
      path: '/createBrand',
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
          const brand = data.brand

          const newBrand = await req.payload.create({
            collection: 'brands',
            data: {
              title: brand,
              brand: brand,
            },
          })

          return NextResponse.json({
            data: {
              id: newBrand.id,
            },
          })
        } else {
          return NextResponse.json({
            errmsg: 'Please Provide Brand',
          })
        }
      },
    },
  ],
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
    },
    {
      name: 'brand',
      label: 'Brand',
      type: 'text',
    },
  ],
}

export default Brands
