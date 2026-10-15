import { ImageResponse } from 'next/og'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size } = await params
  const px = size === '192' ? 192 : 512

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1C1C1E',
          color: '#FFFFFF',
          fontSize: px * 0.55,
          fontWeight: 700,
        }}
      >
        L
      </div>
    ),
    { width: px, height: px }
  )
}
