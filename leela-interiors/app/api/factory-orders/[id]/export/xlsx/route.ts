import { type NextRequest } from 'next/server'
import { factoryOrderFilename, loadFactoryOrderExport } from '@/lib/factory-order-data'
import { buildFactoryOrderXlsx } from '@/lib/factory-order-xlsx'

export const runtime = 'nodejs'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await loadFactoryOrderExport(id)
  if (!data) return Response.json({ error: 'Not found' }, { status: 404 })

  const buffer = await buildFactoryOrderXlsx(data)
  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${factoryOrderFilename(data.order)}.xlsx"`,
    },
  })
}
