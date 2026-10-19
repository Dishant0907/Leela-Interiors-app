'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Receipt, Factory, Menu } from 'lucide-react'
import { Sidebar } from './sidebar'
import { BackButton, MobileBackIcon } from './back-button'

const bottomTabs = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/costings', label: 'Costings', icon: FileText },
  { href: '/invoices', label: 'Invoices', icon: Receipt },
  { href: '/factory-orders', label: 'Factory', icon: Factory },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <main className={`min-w-0 flex-1 overflow-y-auto transition-all duration-300 ml-0 ${collapsed ? 'md:ml-14' : 'md:ml-60'} pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 print:ml-0 print:pb-0`}>
        {/* Mobile top bar */}
        <header
          className="sticky top-0 z-30 flex items-center gap-1 px-2 pt-[env(safe-area-inset-top)] md:hidden print:hidden"
          style={{ backgroundColor: 'var(--bg-sidebar)' }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-md text-text-sidebar active:bg-accent-hover"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <MobileBackIcon />
          <span className="ml-1 truncate text-sm font-semibold text-text-sidebar">Leela Interiors</span>
        </header>

        <BackButton />
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-white/10 pb-[env(safe-area-inset-bottom)] md:hidden print:hidden"
        style={{ backgroundColor: 'var(--bg-sidebar)' }}
      >
        {bottomTabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] ${active ? 'text-white font-medium' : 'text-text-sidebar/60'}`}
            >
              <Icon size={20} />
              {label}
            </Link>
          )
        })}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] text-text-sidebar/60"
        >
          <Menu size={20} />
          More
        </button>
      </nav>
    </div>
  )
}
