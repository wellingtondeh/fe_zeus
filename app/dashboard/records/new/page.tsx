import type { Metadata } from 'next'
import { Suspense } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { RecordForm } from '@/components/features/records/record-form'
import { BreadcrumbWrapper } from '@/components/ui/breadcrumb-wrapper'

export const metadata: Metadata = {
  title: 'Novo Prontuário | Dashboard',
  description: 'Crie um novo prontuário médico',
}

export default function NewRecordPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto lg:max-w-none lg:w-full">
          {/* Breadcrumb */}
          <BreadcrumbWrapper />

          {/* Formulário */}
          <Suspense fallback={<div className="text-center py-8">Carregando...</div>}>
            <RecordForm />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
