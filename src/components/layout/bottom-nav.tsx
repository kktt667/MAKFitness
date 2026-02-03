'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, TrendingUp, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  {
    label: 'Feed',
    href: '/feed',
    icon: Home,
  },
  {
    label: 'Check-in',
    href: '/check-in',
    icon: PlusCircle,
  },
  {
    label: 'Progress',
    href: '/progress',
    icon: TrendingUp,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: User,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 pb-safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all',
                'active:scale-95',
                isActive
                  ? 'text-primary-500'
                  : 'text-neutral-400 hover:text-neutral-600'
              )}
            >
              <Icon
                className={cn(
                  'h-6 w-6 transition-transform',
                  isActive && 'scale-110'
                )}
              />
              <span className={cn(
                'text-xs font-medium',
                isActive && 'font-semibold'
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
