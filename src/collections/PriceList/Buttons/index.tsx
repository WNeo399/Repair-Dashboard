'use client'
import React from 'react'
import ImoportCSVButton from './ImportPriceList'
import ExportCSVButton from './ExportPriceList'
import classes from './index.module.scss'
import type { BeforeListTableClientProps } from 'payload'
export default function ButtonWrap(props: BeforeListTableClientProps) {
  return (
    <div className={classes.wrap}>
      <ExportCSVButton></ExportCSVButton>
      <ImoportCSVButton></ImoportCSVButton>
    </div>
  )
}
