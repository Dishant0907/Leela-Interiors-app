import ExcelJS from 'exceljs'
import { FACTORY_SECTIONS, FACTORY_SECTION_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import type { FactoryOrderExportData, FactoryOrderItem } from '@/types/factory-order'

const DARK = 'FF1C1C1E'
const MID = 'FF52525B'
const LIGHT = 'FFF4F4F5'
const LINE = 'FFD4D4D8'
const FONT_NAME = 'Calibri'

interface Column {
  header: string
  width: number
  align: 'left' | 'center'
  value: (item: FactoryOrderItem, sr: number) => string | number | null
}

const orNull = (n: number | null) => (n === null ? null : n)

function details(i: FactoryOrderItem): string {
  const m = i.meta
  return [
    m.exposed_sides && `Exposed: ${m.exposed_sides}`,
    m.grain && `Grain ${m.grain}`,
    m.side && `Side ${m.side}`,
    m.shelf_type && `Shelf ${m.shelf_type}${m.shelf_qty ? ` × ${m.shelf_qty}` : ''}`,
    m.shutter_type && m.shutter_type,
  ]
    .filter(Boolean)
    .join(' · ')
}

const COLUMNS: Column[] = [
  { header: '#', width: 5, align: 'center', value: (_i, sr) => sr },
  { header: 'Description', width: 46, align: 'left', value: (i) => i.description },
  { header: 'Width (mm)', width: 12, align: 'center', value: (i) => orNull(i.width) },
  { header: 'Depth (mm)', width: 12, align: 'center', value: (i) => orNull(i.depth) },
  { header: 'Height (mm)', width: 12, align: 'center', value: (i) => orNull(i.height) },
  { header: 'Qty', width: 7, align: 'center', value: (i) => i.qty },
  { header: 'Material', width: 18, align: 'left', value: (i) => i.material },
  { header: 'Finish', width: 18, align: 'left', value: (i) => i.finish },
  { header: 'Hardware', width: 18, align: 'left', value: (i) => i.hardware },
  { header: 'Details', width: 34, align: 'left', value: details },
  { header: 'Remarks', width: 28, align: 'left', value: (i) => i.remarks },
]

const LAST_COL = COLUMNS.length
const QTY_COL = COLUMNS.findIndex((c) => c.header === 'Qty') + 1

function fill(argb: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } }
}

const hairline: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: LINE } },
  bottom: { style: 'thin', color: { argb: LINE } },
  left: { style: 'thin', color: { argb: LINE } },
  right: { style: 'thin', color: { argb: LINE } },
}

export async function buildFactoryOrderXlsx(data: FactoryOrderExportData): Promise<Buffer> {
  const { company, order, items } = data
  const wb = new ExcelJS.Workbook()
  wb.creator = company.name
  const ws = wb.addWorksheet('Factory Order', {
    pageSetup: {
      orientation: 'landscape',
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 },
    },
    views: [{ showGridLines: false }],
  })
  COLUMNS.forEach((c, idx) => (ws.getColumn(idx + 1).width = c.width))

  let r = 1
  const merged = (row: number, from = 1, to = LAST_COL) => ws.mergeCells(row, from, row, to)

  // Company banner
  merged(r)
  const name = ws.getCell(r, 1)
  name.value = company.name
  name.font = { name: FONT_NAME, size: 20, bold: true, color: { argb: 'FFFFFFFF' } }
  name.fill = fill(DARK)
  name.alignment = { vertical: 'middle', indent: 1 }
  ws.getRow(r).height = 36
  r++

  if (company.address) {
    merged(r)
    const addr = ws.getCell(r, 1)
    addr.value = company.address
    addr.font = { name: FONT_NAME, size: 10, color: { argb: 'FFFFFFFF' } }
    addr.fill = fill(DARK)
    addr.alignment = { indent: 1, wrapText: true }
    r++
  }

  merged(r)
  const title = ws.getCell(r, 1)
  title.value = `FACTORY ORDER  ·  ${order.order_number}`
  title.font = { name: FONT_NAME, size: 14, bold: true, color: { argb: DARK } }
  title.alignment = { vertical: 'middle', indent: 1 }
  ws.getRow(r).height = 28
  r++

  // Order details: label/value pairs, three per row
  const info: [string, string][] = [
    ['Client', order.client_name],
    ['Order date', formatDate(order.order_date)],
    ['Required by', order.required_date ? formatDate(order.required_date) : ''],
    ['Box colour', order.box_colour],
    ['Shutter colour', order.shutter_colour],
    ['Front edge', order.front_edge],
    ['Contact', [order.contact_person, order.contact_phone].filter(Boolean).join(' · ')],
    [
      'Drawing',
      [order.drawing_ref, order.drawing_revision && `Rev ${order.drawing_revision}`].filter(Boolean).join(' · '),
    ],
    ['Site / delivery', order.site_address],
  ]
  // [label column, value from, value to]
  const groups: [number, number, number][] = [
    [1, 2, 2],
    [3, 4, 6],
    [7, 8, LAST_COL],
  ]
  for (let i = 0; i < info.length; i += 3) {
    const row = ws.getRow(r)
    row.height = 20
    info.slice(i, i + 3).forEach(([label, value], g) => {
      const [labelCol, valueFrom, valueTo] = groups[g]
      const l = row.getCell(labelCol)
      l.value = label
      l.font = { name: FONT_NAME, size: 9, bold: true, color: { argb: MID } }
      l.alignment = { vertical: 'middle', indent: 1 }
      l.fill = fill(LIGHT)
      if (valueTo > valueFrom) ws.mergeCells(r, valueFrom, r, valueTo)
      const v = row.getCell(valueFrom)
      v.value = value
      v.font = { name: FONT_NAME, size: 11, bold: true, color: { argb: DARK } }
      v.alignment = { vertical: 'middle', wrapText: true, indent: 1 }
      for (let c = labelCol; c <= valueTo; c++) row.getCell(c).border = hairline
    })
    r++
  }
  r++

  for (const section of FACTORY_SECTIONS) {
    const sectionItems = items.filter((i) => i.section === section)
    if (sectionItems.length === 0) continue

    merged(r)
    const bar = ws.getCell(r, 1)
    bar.value = `${FACTORY_SECTION_LABELS[section].toUpperCase()}  ·  ${sectionItems.length} item${sectionItems.length > 1 ? 's' : ''}`
    bar.font = { name: FONT_NAME, size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
    bar.fill = fill(MID)
    bar.alignment = { vertical: 'middle', indent: 1 }
    ws.getRow(r).height = 24
    r++

    const head = ws.getRow(r)
    head.height = 22
    COLUMNS.forEach((c, idx) => {
      const cell = head.getCell(idx + 1)
      cell.value = c.header
      cell.font = { name: FONT_NAME, size: 10, bold: true, color: { argb: DARK } }
      cell.fill = fill('FFE4E4E7')
      cell.border = hairline
      cell.alignment = { horizontal: c.align, vertical: 'middle', wrapText: true, indent: c.align === 'left' ? 1 : 0 }
    })
    r++

    let qtyTotal = 0
    sectionItems.forEach((item, idx) => {
      const row = ws.getRow(r)
      qtyTotal += item.qty
      COLUMNS.forEach((c, ci) => {
        const cell = row.getCell(ci + 1)
        cell.value = c.value(item, idx + 1)
        cell.font = { name: FONT_NAME, size: 11, color: { argb: DARK } }
        cell.border = hairline
        cell.alignment = { horizontal: c.align, vertical: 'top', wrapText: true, indent: c.align === 'left' ? 1 : 0 }
        if (idx % 2 === 1) cell.fill = fill('FFFAFAFA')
      })
      r++
    })

    const total = ws.getRow(r)
    const label = total.getCell(QTY_COL - 1)
    label.value = 'Total qty'
    label.font = { name: FONT_NAME, size: 11, bold: true }
    label.alignment = { horizontal: 'right' }
    const sum = total.getCell(QTY_COL)
    sum.value = qtyTotal
    sum.font = { name: FONT_NAME, size: 11, bold: true }
    sum.alignment = { horizontal: 'center' }
    sum.border = hairline
    r += 2
  }

  if (order.notes) {
    merged(r)
    const notes = ws.getCell(r, 1)
    notes.value = `Notes: ${order.notes}`
    notes.font = { name: FONT_NAME, size: 11, color: { argb: DARK } }
    notes.alignment = { wrapText: true, vertical: 'top', indent: 1 }
    ws.getRow(r).height = Math.max(20, Math.ceil(order.notes.length / 150) * 16)
  }

  return Buffer.from(await wb.xlsx.writeBuffer())
}
