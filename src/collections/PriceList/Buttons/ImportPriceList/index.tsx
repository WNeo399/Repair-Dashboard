// @ts-nocheck
'use client'
import React, { useEffect, useState } from 'react'
import classes from './index.module.scss'
import * as XLSX from 'xlsx'
import { Button, toast } from '@payloadcms/ui'

function ImoportCSVButton() {
  const [showUpload, setShowUpload] = useState(false)
  const getUser = async () => {
    const getUser = await fetch('/api/users/me')
    const user = await getUser.json()
    if (user.user.roles.includes('admin')) {
      setShowUpload(true)
    }
  }
  useEffect(() => {
    getUser()
  }, [])
  const [loading, setloading] = useState(false)
  const handleFileUpload = async (event) => {
    setloading(true)
    const res = await fetch('/api/brands?locale=undefined&draft=false&depth=1')
    const ids = await res.json()
    const idsMap = {}
    ids?.docs.forEach((each) => {
      idsMap[each.title] = each.id
    })
    console.log(idsMap)
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      // const options = await payload.findGlobal({
      //   slug: 'Models',
      // })
      // console.log(options)
      reader.onload = async (e) => {
        const data = e?.target?.result // This will be an ArrayBuffer
        const workbook = XLSX.read(data, { type: 'array' })
        // const sheetName = workbook.SheetNames[0]

        // const worksheet = workbook.Sheets[sheetName]
        // const jsonData = XLSX.utils.sheet_to_json(worksheet)
        // console.log(jsonData)
        const isValidPrice = (v) => {
          const n = Number(v)
          return Number.isFinite(n) && n >= 0 ? n : null
        }

        const createBrandIfNeeded = async (sheetName) => {
          const res = await fetch('/api/brands/createBrand', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brand: sheetName }),
          })
          const data = await res.json()
          return data?.data?.id
        }
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

          // get / create brand id
          let brandId = idsMap[sheetName]
          if (!brandId) {
            brandId = await createBrandIfNeeded(sheetName)
            idsMap[sheetName] = brandId
          }

          const temp = jsonData.map((row) => {
            const priceList = Object.entries(row)
              .filter(
                ([key, val]) =>
                  key !== 'Model' && !key.includes('EMPTY') && val !== '/' && val !== '',
              )
              .map(([key, val]) => {
                const price = isValidPrice(val)
                return {
                  title: key,
                  price,
                  active: price !== null,
                }
              })

            return {
              brand: brandId,
              title: `${sheetName} ${row['Model']}`,
              model: row['Model'],
              priceList,
            }
          })

          console.log(temp)

          const response = await fetch('/api/priceList/updatePriceList', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(temp),
          })
        }
        // workbook.SheetNames.forEach(async (sheetName) => {
        //   const worksheet = workbook.Sheets[sheetName]
        //   const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
        //   const temp = []
        //   let brandId = idsMap[sheetName]
        //   if (!brand) {
        //     const createBrand = await fetch('/api/brands/createBrand', {
        //       method: 'POST',
        //       body: {
        //         brand: sheetName,
        //       },
        //     })
        //     brandId = await createBrand.json().data.id
        //   }
        //   jsonData.forEach((each) => {
        //     const repairModel = {
        //       brand: brandId,
        //       model: each['Model'],
        //       priceList: [],
        //     }
        //     Object.keys(each).forEach((key) => {
        //       if (key != 'Model') {
        //         if (each[key] != '/' && !key.includes('EMPTY')) {
        //           let price
        //           if (each[key] || each[key] === 0) {
        //             price = Number(each[key])
        //           }
        //           repairModel.priceList.push({
        //             title: key,
        //             price: price != null && price != NaN && price >= 0 ? price : null,
        //             active: price != null && price != NaN && price >= 0 ? true : false,
        //           })
        //         }
        //       }
        //     })
        //     temp.push(repairModel)
        //   })
        //   console.log(temp)

        //   const response = await fetch(`/api/priceList/updatePriceList`, {
        //     method: 'POST',
        //     body: JSON.stringify(temp),
        //     headers: {
        //       'Content-Type': 'application/json',
        //     },
        //   })
        // })
        setloading(false)
        toast.success(`Price List Update Succefully!`, {
          onAutoClose: () => {
            window.location.reload()
          },
          duration: 1000,
        })
      }
      reader.readAsArrayBuffer(file) // Read the file as ArrayBuffer
    } else {
      toast.error(`File upload faild! Please check and upload again.`)
      setloading(false)
    }
  }
  return (
    <>
      {showUpload && (
        <>
          <Button
            size="small"
            buttonStyle="primary"
            className={classes.noMargin}
            onClick={() => document.getElementById('upload-button').click()}
          >
            {loading ? 'Loading' : 'Imoport Price List'}
          </Button>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="upload-button"
          />
        </>
      )}
    </>
  )
}

export default ImoportCSVButton
