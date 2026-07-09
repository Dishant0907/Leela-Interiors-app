'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${collapsed ? 'ml-14' : 'ml-60'} print:ml-0`}>
        {children}
      </main>
    </div>
  )
}
