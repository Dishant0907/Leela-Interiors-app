import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { FACTORY_SECTIONS, FACTORY_SECTION_LABELS } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import type { FactoryOrderExportData, FactoryOrderItem } from '@/types/factory-order'

const DARK = '#1C1C1E'
const MID = '#52525B'
const LINE = '#D4D4D8'

const styles = StyleSheet.create({
  page: { paddingTop: 28, paddingBottom: 40, paddingHorizontal: 28, fontSize: 9, fontFamily: 'Helvetica', color: DARK },
  banner: { backgroundColor: DARK, color: '#FFFFFF', paddingVertical: 12, paddingHorizontal: 14, marginBottom: 10 },
  company: { fontSize: 18, fontFamily: 'Helvetica-Bold' },
  address: { fontSize: 8.5, marginTop: 3, color: '#E4E4E7' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
  title: { fontSize: 13, fontFamily: 'Helvetica-Bold' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderLeftWidth: 1, borderColor: LINE, marginBottom: 12 },
  infoCell: { width: '33.333%', flexDirection: 'row', borderRightWidth: 1, borderBottomWidth: 1, borderColor: LINE },
  infoLabel: { width: '38%', backgroundColor: '#F4F4F5', color: MID, fontSize: 8, fontFamily: 'Helvetica-Bold', padding: 5 },
  infoValue: { width: '62%', padding: 5, fontFamily: 'Helvetica-Bold' },
  sectionBar: { backgroundColor: MID, color: '#FFFFFF', paddingVertical: 5, paddingHorizontal: 8, fontFamily: 'Helvetica-Bold', fontSize: 10 },
  headRow: { flexDirection: 'row', backgroundColor: '#E4E4E7', borderBottomWidth: 1, borderColor: LINE },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: LINE },
  zebra: { backgroundColor: '#FAFAFA' },
  headText: { fontFamily: 'Helvetica-Bold', fontSize: 8, padding: 5 },
  cellText: { padding: 5 },
  center: { textAlign: 'center' },
  total: { textAlign: 'right', fontFamily: 'Helvetica-Bold', marginTop: 4 },
  footer: { marginTop: 6 },
  footerLine: { marginBottom: 3 },
  pageNumber: { position: 'absolute', bottom: 18, left: 28, right: 28, textAlign: 'right', fontSize: 8, color: MID },
})

interface Column {
  label: string
  flex: number
  center?: boolean
  value: (item: FactoryOrderItem, sr: number) => string
}

const show = (n: number | null) => (n === null ? '' : String(n))

function details(i: FactoryOrderItem): string {
  const m = i.meta
  return [
    m.exposed_sides && `Exposed: ${m.exposed_sides}`,
    m.grain && `Grain ${m.grain}`,
    m.side && `Side ${m.side}`,
    m.shelf_type && `Shelf ${m.shelf_type}${m.shelf_qty ? ` x ${m.shelf_qty}` : ''}`,
    m.shutter_type,
  ]
    .filter(Boolean)
    .join(' | ')
}

const COLUMNS: Column[] = [
  { label: '#', flex: 0.5, center: true, value: (_i, sr) => String(sr) },
  { label: 'Description', flex: 4.2, value: (i) => i.description },
  { label: 'W (mm)', flex: 1, center: true, value: (i) => show(i.width) },
  { label: 'D (mm)', flex: 1, center: true, value: (i) => show(i.depth) },
  { label: 'H (mm)', flex: 1, center: true, value: (i) => show(i.height) },
  { label: 'Qty', flex: 0.7, center: true, value: (i) => String(i.qty) },
  { label: 'Material', flex: 1.5, value: (i) => i.material },
  { label: 'Finish', flex: 1.5, value: (i) => i.finish },
  { label: 'Hardware', flex: 1.5, value: (i) => i.hardware },
  { label: 'Details', flex: 2.6, value: details },
  { label: 'Remarks', flex: 2, value: (i) => i.remarks },
]

export function FactoryOrderPdf({ data }: { data: FactoryOrderExportData }) {
  const { company, order, items } = data

  const info: [string, string][] = [
    ['Client', order.client_name],
    ['Order date', formatDate(order.order_date)],
    ['Required by', order.required_date ? formatDate(order.required_date) : '-'],
    ['Box colour', order.box_colour || '-'],
    ['Shutter colour', order.shutter_colour || '-'],
    ['Front edge', order.front_edge || '-'],
    ['Contact', [order.contact_person, order.contact_phone].filter(Boolean).join(' | ') || '-'],
    [
      'Drawing',
      [order.drawing_ref, order.drawing_revision && `Rev ${order.drawing_revision}`].filter(Boolean).join(' | ') || '-',
    ],
    ['Site / delivery', order.site_address || '-'],
  ]

  const groups = FACTORY_SECTIONS.map((section) => ({
    section,
    items: items.filter((i) => i.section === section),
  })).filter((g) => g.items.length > 0)

  return (
    <Document title={`${order.order_number} - ${order.client_name}`} author={company.name}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.banner}>
          <Text style={styles.company}>{company.name}</Text>
          {company.address ? <Text style={styles.address}>{company.address}</Text> : null}
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>FACTORY ORDER</Text>
          <Text style={styles.title}>{order.order_number}</Text>
        </View>

        <View style={styles.infoGrid}>
          {info.map(([label, value]) => (
            <View key={label} style={styles.infoCell} wrap={false}>
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={styles.infoValue}>{value}</Text>
            </View>
          ))}
        </View>

        {groups.map((group) => (
          <View key={group.section} style={{ marginBottom: 12 }}>
            <Text style={styles.sectionBar} minPresenceAhead={60}>
              {FACTORY_SECTION_LABELS[group.section].toUpperCase()} - {group.items.length} item
              {group.items.length > 1 ? 's' : ''}
            </Text>
            <View style={styles.headRow}>
              {COLUMNS.map((c) => (
                <Text key={c.label} style={[styles.headText, { flex: c.flex }, c.center ? styles.center : {}]}>
                  {c.label}
                </Text>
              ))}
            </View>
            {group.items.map((item, idx) => (
              <View key={item.id} style={[styles.row, idx % 2 === 1 ? styles.zebra : {}]} wrap={false}>
                {COLUMNS.map((c) => (
                  <Text key={c.label} style={[styles.cellText, { flex: c.flex }, c.center ? styles.center : {}]}>
                    {c.value(item, idx + 1)}
                  </Text>
                ))}
              </View>
            ))}
            <Text style={styles.total}>Total qty: {group.items.reduce((sum, i) => sum + i.qty, 0)}</Text>
          </View>
        ))}

        {order.notes ? (
          <View style={styles.footer} wrap={false}>
            <Text style={styles.footerLine}>Notes: {order.notes}</Text>
          </View>
        ) : null}

        <Text
          style={styles.pageNumber}
          fixed
          render={({ pageNumber, totalPages }) => `${company.name}  ·  ${order.order_number}  ·  Page ${pageNumber} of ${totalPages}`}
        />
      </Page>
    </Document>
  )
}
