import { type NextRequest } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { FactoryOrderPdf } from '@/components/factory-order/FactoryOrderPdf'
import { factoryOrderFilename, loadFactoryOrderExport } from '@/lib/factory-order-data'

export const runtime = 'nodejs'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await loadFactoryOrderExport(id)
  if (!data) return Response.json({ error: 'Not found' }, { status: 404 })

  const buffer = await renderToBuffer(FactoryOrderPdf({ data }))
  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${factoryOrderFilename(data.order)}.pdf"`,
    },
  })
}
