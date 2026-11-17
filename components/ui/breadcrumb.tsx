'use client'

import Link from 'next/link'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'

export function Breadcrumb() {
  const { breadcrumbs } = useBreadcrumb()

  if (breadcrumbs.length === 0) {
    return null
  }

  return (
    <div className="mb-4 sm:mb-6">
      <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1

          return (
            <div key={index} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {index > 0 && <span className="text-gray-400">/</span>}
              {isLast ? (
                <span className="text-blue-600 font-medium flex items-center gap-1 whitespace-nowrap">
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.label.length > 15 ? item.label.substring(0, 15) + '...' : item.label}</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.label.length > 15 ? item.label.substring(0, 15) + '...' : item.label}</span>
                </Link>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
