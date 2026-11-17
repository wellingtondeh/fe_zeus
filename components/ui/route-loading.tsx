'use client'

import { useNavigation } from '@/components/providers/navigation-provider'
import { useState, useEffect } from 'react'

export function RouteLoading() {
  const { isNavigating } = useNavigation()
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    if (isNavigating) {
      // Mostrar loading apenas após um pequeno delay para evitar flash em navegações rápidas
      const timer = setTimeout(() => {
        setShowLoading(true)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setShowLoading(false)
    }
  }, [isNavigating])

  if (!showLoading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
        <p className="text-white font-medium text-xs">Carregando...</p>
      </div>
    </div>
  )
}
