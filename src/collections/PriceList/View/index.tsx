// @ts-nocheck
'use client'
import React, { useEffect, useState } from 'react'

import classes from './index.module.scss'
import ButtonWrap from '../../PriceList/Buttons'
import { ListViewClientProps } from 'payload'
function CustomView(_prop: ListViewClientProps) {
  const [roles, setRoles] = useState('user')
  const [groupByBrand, setGroupByBrand] = useState([])
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedAllTitle, setSelectedAllTitle] = useState([])
  const [selectedAllItems, setSelectedAllItems] = useState([])
  const getUser = async () => {
    try {
      const req = await fetch('/api/users/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-type': 'application/json',
        },
      })
      const resData = await req.json()
      console.log(resData)
      if (resData.user.roles.includes('admin')) {
        setRoles('admin')
      }
    } catch (err) {
      console.log(err)
    }
  }
  useEffect(() => {
    getUser()
  }, [])

  const brandOrder = [
    'Samsung',
    'Google',
    'Apple',
    'Apple iPad',
    'HUAWEI',
    'OPPO',
    'Apple Watch',
    'Apple Macbook',
  ]

  function groupByBrandTitle(data) {
    // First, group items by brand.title
    const grouped = data.reduce((acc, item) => {
      const key = item?.brand?.title || 'Unknown'
      ;(acc[key] ||= []).push(item)
      return acc
    }, {})

    // Then, create an array in the specified brand order
    return brandOrder
      .map((brand) => ({
        brand,
        items: grouped[brand] || [],
      }))
      .filter((group) => group.items.length > 0)
  }
  useEffect(() => {
    const getPriceList = async () => {
      const getData = await fetch('/api/priceList?limit=9999')
      const priceList = await getData.json()
      const groupedData = groupByBrandTitle(priceList.docs)
      console.log(groupedData)
      setGroupByBrand(groupedData)
      setSelectedBrand(brandOrder[0])
    }
    getPriceList()
  }, [])

  useEffect(() => {
    const mapped = groupByBrand.find((brand) => brand.brand == selectedBrand)
    if (mapped && mapped.items) {
      const allTitlesSet = new Set()
      mapped.items.forEach((item) => {
        item.priceList.forEach((p) => {
          allTitlesSet.add(p.title)
        })
      })
      const priceTitles = Array.from(allTitlesSet)
      setSelectedAllTitle(priceTitles)
      mapped.items.sort((a, b) => b.title.localeCompare(a.title))
      setSelectedAllItems(mapped.items)
    }
  }, [selectedBrand])
  return (
    <div
      className="collection-list"
      style={{ height: 'calc(100vh - 95px)', display: 'flex', flexDirection: 'column' }}
    >
      <div
        className="gutter--left gutter--right collection-list__wrap"
        style={{ paddingBottom: '20px' }}
      >
        <header className="collection-list__header">
          <h1>Price List</h1>
        </header>
        {roles == 'admin' ? <ButtonWrap></ButtonWrap> : <></>}
      </div>
      <div>
        <div className={classes.priceBrand}>
          {groupByBrand.map((brand) => (
            <div
              key={brand.brand}
              className={`${classes.brandTitle} ${
                brand.brand == selectedBrand ? classes.active : ''
              }`}
              onClick={() => {
                setSelectedBrand(brand.brand)
              }}
            >
              {brand.brand}
            </div>
          ))}
        </div>
      </div>
      <div className={classes.priceTableWrap}>
        {selectedBrand && selectedAllItems.length > 0 ? (
          <table border={1} cellPadding="8">
            <thead>
              <tr>
                <th>Model</th>
                {selectedAllTitle.map((title) => (
                  <th key={title}>{title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedAllItems.map((item) => {
                const priceMap = Object.fromEntries(item.priceList.map((p) => [p.title, p.price]))
                return (
                  <tr key={item.id}>
                    <td>{item.model}</td>
                    {selectedAllTitle.map((title) => (
                      <td key={title}>{priceMap[title] ? `$${priceMap[title]}` : '-'}</td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}

export default CustomView
