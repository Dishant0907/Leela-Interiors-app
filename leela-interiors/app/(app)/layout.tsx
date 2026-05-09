import { Sidebar } from '@/components/layout/sidebar'

export const dynamic = 'force-dynamic'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-60 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
