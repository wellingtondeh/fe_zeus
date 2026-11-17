import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BreadcrumbWrapper } from '@/components/ui/breadcrumb-wrapper'
import { type MedicalRecord } from '@/types/record'
import { EditRecordButton } from '@/components/features/records/edit-record-button'

export const metadata: Metadata = {
  title: 'Visualizar Prontuário | Dashboard',
  description: 'Visualize os detalhes do prontuário médico',
}

// Dados mockados - em produção, viriam de uma API ou banco de dados
const mockRecords: Record<string, MedicalRecord> = {
  '1': {
    id: '1',
    patientId: '1',
    patientName: 'Maria Silva',
    title: 'Consulta Inicial',
    content: '<p><strong>Queixa Principal:</strong> Paciente apresentou queixas de dor de cabeça frequente há aproximadamente 2 semanas.</p><p><em>História Clínica:</em> Paciente relata que a dor é pulsátil, principalmente na região frontal, piora com esforço físico e melhora com repouso.</p><p><u>Exame Físico:</u></p><ul><li>PA: 120/80 mmHg</li><li>FC: 72 bpm</li><li>Estado geral: bom</li></ul><p><img src="https://via.placeholder.com/400x200" alt="Exame" /></p>',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: 'Dr. João',
  },
  '2': {
    id: '2',
    patientId: '2',
    patientName: 'João Santos',
    title: 'Acompanhamento',
    content: '<p>Paciente em acompanhamento para tratamento...</p>',
    createdAt: '2024-01-16T14:30:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
    createdBy: 'Dr. Maria',
  },
  '3': {
    id: '3',
    patientId: '1',
    patientName: 'Maria Silva',
    title: 'Retorno',
    content: '<p>Paciente retornou para avaliação...</p>',
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-20T09:15:00Z',
    createdBy: 'Dr. João',
  },
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface ViewRecordPageProps {
  params: Promise<{ id: string }>
}

export default async function ViewRecordPage({ params }: ViewRecordPageProps) {
  const { id } = await params
  const record = mockRecords[id]

  if (!record) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <Card.Content className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Prontuário não encontrado
                </h2>
                <p className="text-gray-600 mb-4">
                  O prontuário solicitado não foi encontrado.
                </p>
                <Link href="/dashboard/records">
                  <Button variant="outline">Voltar para Lista</Button>
                </Link>
              </Card.Content>
            </Card>
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

          {/* Conteúdo do Prontuário */}
          <Card className="w-full">
            <Card.Header>
              <div className="flex items-start justify-between">
                <div>
                  <Card.Title>{record.title}</Card.Title>
                  <Card.Description className="mt-2">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {record.patientName}
                    </span>
                  </Card.Description>
                </div>
                <Suspense fallback={
                  <Button variant="outline" size="sm" className="flex items-center gap-2" disabled>
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Editar
                  </Button>
                }>
                  <EditRecordButton recordId={record.id} patientId={record.patientId} />
                </Suspense>
              </div>
            </Card.Header>

            <Card.Content>
              <div
                className="text-gray-700 prose prose-sm max-w-none
                  [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded [&_img]:my-4
                  [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-2
                  [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-2
                  [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2
                  [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2
                  [&_p]:mb-2 [&_p]:leading-relaxed
                  [&_strong]:font-semibold
                  [&_em]:italic
                  [&_u]:underline
                  [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800"
                dangerouslySetInnerHTML={{ __html: record.content }}
              />

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
                  <div>
                    <p>
                      <span className="font-medium">Criado por:</span> {record.createdBy}
                    </p>
                    <p>
                      <span className="font-medium">Criado em:</span> {formatDate(record.createdAt)}
                    </p>
                    {record.updatedAt !== record.createdAt && (
                      <p>
                        <span className="font-medium">Atualizado em:</span> {formatDate(record.updatedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </main>
    </div>
  )
}
