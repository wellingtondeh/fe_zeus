import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { RecordForm } from '@/components/features/records/record-form'
import { BreadcrumbWrapper } from '@/components/ui/breadcrumb-wrapper'
import { getSeedRecordById, STATIC_RECORD_IDS } from '@/lib/mock'

export const metadata: Metadata = {
  title: 'Editar Prontuário | Dashboard',
  description: 'Edite o prontuário médico',
}

export function generateStaticParams() {
  return STATIC_RECORD_IDS.map((id) => ({ id }))
}

interface EditRecordPageProps {
  params: Promise<{ id: string }>
}

export default async function EditRecordPage({ params }: EditRecordPageProps) {
  const { id } = await params
  const seed = getSeedRecordById(id)

  if (!seed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Prontuário não encontrado
              </h2>
              <p className="text-gray-600 mb-4">
                O prontuário solicitado não foi encontrado.
              </p>
              <Link href="/dashboard/records">
                <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  Voltar para Lista
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const recordData = {
    id: seed.id,
    patientId: seed.patientId,
    title: seed.title,
    content: seed.content,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto lg:max-w-none lg:w-full">
          <BreadcrumbWrapper />

          <Suspense fallback={<div className="text-center py-8">Carregando...</div>}>
            <RecordForm initialData={recordData} recordId={id} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
