import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DividerProps {
  children?: ReactNode
  className?: string
}

export function Divider({ children, className }: DividerProps) {
  return (
    <div className={cn('relative flex items-center py-4', className)}>
      <div className="flex-grow border-t border-gray-300" />
      {children && (
        <span className="mx-4 flex-shrink text-sm text-gray-500">
          {children}
        </span>
      )}
      <div className="flex-grow border-t border-gray-300" />
    </div>
  )
}
