// @ts-nocheck
'use client'
import React, { useState } from 'react'
import { Button } from '@payloadcms/ui'
import classes from './index.module.scss'
import * as XLSX from 'xlsx'

function ExportCSVButton() {
  const [loading, setloading] = useState(false)
  const handleExportList = async () => {
    setloading(true)
    const req = await fetch('/api/repairPriceList/exportList')
    let data = await req.json()
    data = data.docs
    const workbook = XLSX.utils.book_new()

    // Group models by brand title
    const groupedByBrand = data.reduce(
      (acc, item) => {
        const brandTitle = item.brand.title
        if (!acc[brandTitle]) acc[brandTitle] = []
        acc[brandTitle].push(item)
        return acc
      },
      {} as Record<string, typeof data>,
    )

    Object.entries(groupedByBrand).forEach(([brand, items]) => {
      //   console.log(brand)
      const brandItems = items as typeof data // 👈 Cast `items` to the correct type

      // Collect all unique price item titles across all models
      const priceTitlesSet = new Set<string>()
      brandItems.forEach((model) => model.priceList.forEach((p) => priceTitlesSet.add(p.title)))
      const priceTitles = Array.from(priceTitlesSet)

      const rows = brandItems.map((model) => {
        const row = {
          Model: model.model,
        }

        priceTitles.forEach((title) => {
          const priceItem = model.priceList.find((p) => p.title === title)
          row[title] = priceItem && priceItem.active ? priceItem.price : ''
        })

        return row
      })

      const worksheet = XLSX.utils.json_to_sheet(rows)
      XLSX.utils.book_append_sheet(workbook, worksheet, brand)
    })
    XLSX.writeFile(workbook, 'Price_List.xlsx')
    setloading(false)
  }
  return (
    <>
      <Button
        size="small"
        buttonStyle="secondary"
        className={classes.noMargin}
        onClick={() => {
          handleExportList()
        }}
      >
        {loading ? 'Loading' : 'Export Price List'}
      </Button>
    </>
  )
}

export default ExportCSVButton
