import { type ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon?: ReactNode
  className?: string
}

export function MetricCard({
  label,
  value,
  change,
  trend = 'neutral',
  icon,
  className,
}: MetricCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  }

  const trendIcons = {
    up: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
    down: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
        />
      </svg>
    ),
    neutral: null,
  }

  return (
    <Card className={cn('p-4 sm:p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-sm font-medium text-gray-600 mb-1 truncate">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 mt-2 text-sm sm:text-sm flex-wrap',
                trendColors[trend]
              )}
            >
              {trendIcons[trend]}
              <span>
                {change > 0 ? '+' : ''}
                {change}%
              </span>
              <span className="text-gray-500 hidden sm:inline">vs mês anterior</span>
              <span className="text-gray-500 sm:hidden">vs anterior</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-2 sm:ml-4 text-gray-400">{icon}</div>
        )}
      </div>
    </Card>
  )
}
