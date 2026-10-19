'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Receipt, Users, Package, LogOut, ChevronLeft, ChevronRight, BarChart2, Settings, Factory, FolderOpen, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/costings', label: 'Costings', icon: FileText },
  { href: '/invoices', label: 'Invoices', icon: Receipt },
  { href: '/documents', label: 'Documents', icon: FolderOpen },
  { href: '/factory-orders', label: 'Factory Orders', icon: Factory },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/items', label: 'Items', icon: Package },
  { href: '/gst-report', label: 'GST Report', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

// Below md the sidebar is an off-canvas drawer (always full width, labels shown).
// From md up it is the fixed, collapsible sidebar.
export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Hide text labels only on md+ when collapsed; the drawer always shows them
  const label = collapsed ? 'md:hidden' : ''
  const itemLayout = collapsed ? 'gap-3 px-3 md:justify-center md:gap-0 md:px-0' : 'gap-3 px-3'

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Backdrop (mobile only) */}
      <div
        onClick={onMobileClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden print:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh w-64 ${collapsed ? 'md:w-14' : 'md:w-60'} shrink-0 flex-col transition-all duration-300 print:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ backgroundColor: 'var(--bg-sidebar)' }}
      >
        {/* Monogram + wordmark + toggle */}
        <div className={`flex items-center gap-3 ${collapsed ? 'md:justify-center md:gap-0' : ''} px-3 py-5 relative`}>
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold leading-none">LI</span>
          </div>
          <span className={`text-text-sidebar text-sm font-semibold truncate ${label}`}>Leela Interiors</span>
          {/* Desktop collapse toggle */}
          <button
            onClick={onToggle}
            className={`hidden md:flex ${collapsed ? 'absolute -right-3 top-1/2 -translate-y-1/2' : 'ml-auto'} w-6 h-6 rounded-full bg-accent-hover items-center justify-center text-text-sidebar hover:opacity-80 transition-opacity shrink-0`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-md text-text-sidebar active:bg-accent-hover md:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {navLinks.map(({ href, label: text, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={onMobileClose}
                title={collapsed ? text : undefined}
                className={`flex items-center ${itemLayout} py-3 md:py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-white text-[#1C1C1E] font-medium'
                    : 'text-text-sidebar hover:bg-accent-hover'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span className={label}>{text}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="px-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            onClick={handleSignOut}
            title={collapsed ? 'Sign out' : undefined}
            className={`flex items-center ${itemLayout} py-3 md:py-2 rounded-md text-sm text-text-sidebar hover:bg-accent-hover w-full transition-colors`}
          >
            <LogOut size={18} className="shrink-0" />
            <span className={label}>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
