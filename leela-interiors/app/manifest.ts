import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Leela Interiors',
    short_name: 'Leela',
    description: 'Leela Interiors — costing, invoicing, and client management',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#F5F5F4',
    theme_color: '#1C1C1E',
    icons: [
      { src: '/api/pwa-icon/192', sizes: '192x192', type: 'image/png' },
      { src: '/api/pwa-icon/512', sizes: '512x512', type: 'image/png' },
      { src: '/api/pwa-icon/512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
