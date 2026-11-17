import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-white shadow-lg',
        className
      )}
    >
      {children}
    </div>
  )
}

function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-4 sm:p-6 pb-3 sm:pb-4', className)}>
      {children}
    </div>
  )
}

function CardTitle({ children, className }: CardProps) {
  return (
    <h2
      className={cn(
        'text-xl sm:text-2xl font-semibold leading-none tracking-tight text-gray-900',
        className
      )}
    >
      {children}
    </h2>
  )
}

function CardDescription({ children, className }: CardProps) {
  return (
    <p className={cn('text-sm text-gray-500', className)}>{children}</p>
  )
}

function CardContent({ children, className }: CardProps) {
  return <div className={cn('p-4 sm:p-6 pt-0', className)}>{children}</div>
}

function CardFooter({ children, className }: CardProps) {
  return (
    <div className={cn('flex items-center p-4 sm:p-6 pt-0', className)}>
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Title = CardTitle
Card.Description = CardDescription
Card.Content = CardContent
Card.Footer = CardFooter
