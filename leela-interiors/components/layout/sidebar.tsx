'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Receipt, Users, Package, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/costings', label: 'Costings', icon: FileText },
  { href: '/invoices', label: 'Invoices', icon: Receipt },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/items', label: 'Items', icon: Package },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      className="w-60 shrink-0 flex flex-col h-screen fixed left-0 top-0 print:hidden"
      style={{ backgroundColor: 'var(--bg-sidebar)' }}
    >
      {/* Monogram + wordmark */}
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="w-8 h-8 bg-black rounded flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold leading-none">LI</span>
        </div>
        <span className="text-text-sidebar text-sm font-semibold">Leela Interiors</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 space-y-0.5">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-accent text-white font-medium'
                  : 'text-text-sidebar hover:bg-accent-hover'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-2 pb-4">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-text-sidebar hover:bg-accent-hover w-full transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
