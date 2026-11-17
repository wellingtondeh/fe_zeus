'use client'

import { Suspense } from 'react'
import { Breadcrumb } from './breadcrumb'
import { useBreadcrumbSetup } from '@/hooks/use-breadcrumb-setup'

function BreadcrumbContent() {
  useBreadcrumbSetup()
  return <Breadcrumb />
}

export function BreadcrumbWrapper() {
  return (
    <Suspense fallback={<div className="mb-6 h-6" />}>
      <BreadcrumbContent />
    </Suspense>
  )
}
