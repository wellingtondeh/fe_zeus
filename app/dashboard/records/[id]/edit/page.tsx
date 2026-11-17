import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { RecordForm } from '@/components/features/records/record-form'
import { BreadcrumbWrapper } from '@/components/ui/breadcrumb-wrapper'
import { type MedicalRecordInput } from '@/types/record'

export const metadata: Metadata = {
  title: 'Editar Prontuário | Dashboard',
  description: 'Edite o prontuário médico',
}

// Dados mockados - em produção, viriam de uma API ou banco de dados
const mockRecords: Record<string, MedicalRecordInput & { id: string }> = {
  '1': {
    id: '1',
    patientId: '1',
    title: 'Consulta Inicial',
    content: '<p><strong>Queixa Principal:</strong> Paciente apresentou queixas de dor de cabeça frequente há aproximadamente 2 semanas.</p>',
  },
  '2': {
    id: '2',
    patientId: '2',
    title: 'Acompanhamento',
    content: '<p>Paciente em acompanhamento para tratamento...</p>',
  },
  '3': {
    id: '3',
    patientId: '1',
    title: 'Retorno',
    content: '<p>Paciente retornou para avaliação...</p>',
  },
}

interface EditRecordPageProps {
  params: Promise<{ id: string }>
}

export default async function EditRecordPage({ params }: EditRecordPageProps) {
  const { id } = await params
  const recordData = mockRecords[id]

  if (!recordData) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto lg:max-w-none lg:w-full">
          {/* Breadcrumb */}
          <BreadcrumbWrapper />

          {/* Formulário */}
          <Suspense fallback={<div className="text-center py-8">Carregando...</div>}>
            <RecordForm initialData={recordData} recordId={id} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
