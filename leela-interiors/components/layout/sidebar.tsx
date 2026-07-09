'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Receipt, Users, Package, LogOut, ChevronLeft, ChevronRight, BarChart2, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/costings', label: 'Costings', icon: FileText },
  { href: '/invoices', label: 'Invoices', icon: Receipt },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/items', label: 'Items', icon: Package },
  { href: '/gst-report', label: 'GST Report', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      className={`${collapsed ? 'w-14' : 'w-60'} shrink-0 flex flex-col h-screen fixed left-0 top-0 print:hidden transition-all duration-300`}
      style={{ backgroundColor: 'var(--bg-sidebar)' }}
    >
      {/* Monogram + wordmark + toggle */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-5 relative`}>
        <div className="w-8 h-8 bg-black rounded flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold leading-none">LI</span>
        </div>
        {!collapsed && (
          <span className="text-text-sidebar text-sm font-semibold truncate">Leela Interiors</span>
        )}
        <button
          onClick={onToggle}
          className={`${collapsed ? 'absolute -right-3 top-1/2 -translate-y-1/2' : 'ml-auto'} w-6 h-6 rounded-full bg-accent-hover flex items-center justify-center text-text-sidebar hover:opacity-80 transition-opacity shrink-0`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 space-y-0.5">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-white text-[#1C1C1E] font-medium'
                  : 'text-text-sidebar hover:bg-accent-hover'
              }`}
            >
              <Icon size={16} />
              {!collapsed && label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-2 pb-4">
        <button
          onClick={handleSignOut}
          title={collapsed ? 'Sign out' : undefined}
          className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-md text-sm text-text-sidebar hover:bg-accent-hover w-full transition-colors`}
        >
          <LogOut size={16} />
          {!collapsed && 'Sign out'}
        </button>
      </div>
    </aside>
  )
}
