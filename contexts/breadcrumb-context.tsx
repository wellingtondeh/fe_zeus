'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export interface BreadcrumbItem {
  label: string
  href: string
  icon?: ReactNode
}

interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbItem[]
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
  addBreadcrumb: (item: BreadcrumbItem) => void
  removeBreadcrumb: (index: number) => void
  clearBreadcrumbs: () => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
  undefined
)

const STORAGE_KEY = 'breadcrumb-history'

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbsState] = useState<BreadcrumbItem[]>([])

  // Carregar do sessionStorage na inicialização
  // Nota: Não carregamos do sessionStorage porque os ícones são elementos React
  // que não podem ser serializados. O breadcrumb será reconstruído pelo hook useBreadcrumbSetup
  useEffect(() => {
    // Breadcrumbs serão reconstruídos pelo useBreadcrumbSetup baseado na rota atual
  }, [])

  // Salvar no sessionStorage sempre que mudar
  const setBreadcrumbs = useCallback((newBreadcrumbs: BreadcrumbItem[]) => {
    setBreadcrumbsState((prev) => {
      // Comparar apenas dados serializáveis (sem ícones) para evitar loops
      const prevSerializable = prev.map(({ icon, ...rest }) => rest)
      const newSerializable = newBreadcrumbs.map(({ icon, ...rest }) => rest)
      const prevStr = JSON.stringify(prevSerializable)
      const newStr = JSON.stringify(newSerializable)
      if (prevStr === newStr) {
        return prev
      }
      
      if (typeof window !== 'undefined') {
        try {
          // Salvar apenas dados serializáveis (sem ícones)
          sessionStorage.setItem(STORAGE_KEY, newStr)
        } catch {
          // Ignora erros de storage
        }
      }
      return newBreadcrumbs
    })
  }, [])

  const addBreadcrumb = useCallback((item: BreadcrumbItem) => {
    setBreadcrumbsState((prev) => {
      // Remove duplicatas baseado no href
      const filtered = prev.filter((b) => b.href !== item.href)
      const newBreadcrumbs = [...filtered, item]
      // Não salvamos no sessionStorage porque contém elementos React (ícones)
      return newBreadcrumbs
    })
  }, [])

  const removeBreadcrumb = useCallback((index: number) => {
    setBreadcrumbsState((prev) => {
      const newBreadcrumbs = prev.filter((_, i) => i !== index)
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newBreadcrumbs))
        } catch {
          // Ignora erros de storage
        }
      }
      return newBreadcrumbs
    })
  }, [])

  const clearBreadcrumbs = useCallback(() => {
    setBreadcrumbsState([])
    // Não precisamos limpar sessionStorage já que não salvamos mais lá
  }, [])

  return (
    <BreadcrumbContext.Provider
      value={{
        breadcrumbs,
        setBreadcrumbs,
        addBreadcrumb,
        removeBreadcrumb,
        clearBreadcrumbs,
      }}
    >
      {children}
    </BreadcrumbContext.Provider>
  )
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext)
  if (context === undefined) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider')
  }
  return context
}
