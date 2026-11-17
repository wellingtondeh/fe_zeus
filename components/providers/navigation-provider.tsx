'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface NavigationContextType {
  isNavigating: boolean
  startNavigation: () => void
}

const NavigationContext = createContext<NavigationContextType>({
  isNavigating: false,
  startNavigation: () => {},
})

export function useNavigation() {
  return useContext(NavigationContext)
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)
  const previousPathname = useRef<string>(pathname)

  const startNavigation = () => {
    setIsNavigating(true)
  }

  useEffect(() => {
    // Detectar cliques em links Next.js internos
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]')
      
      if (link) {
        const href = link.getAttribute('href')
        // Apenas para links internos do Next.js
        if (href && href.startsWith('/') && !href.startsWith('//') && href !== pathname) {
          setIsNavigating(true)
        }
      }
    }

    document.addEventListener('click', handleClick, true)

    return () => {
      document.removeEventListener('click', handleClick, true)
    }
  }, [pathname])

  useEffect(() => {
    // Quando a rota mudar, desativar o loading imediatamente
    if (previousPathname.current !== pathname) {
      previousPathname.current = pathname
      setIsNavigating(false)
    }
  }, [pathname])

  useEffect(() => {
    // Bloquear scroll apenas quando necessário
    if (isNavigating) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isNavigating])

  return (
    <NavigationContext.Provider value={{ isNavigating, startNavigation }}>
      {children}
    </NavigationContext.Provider>
  )
}
