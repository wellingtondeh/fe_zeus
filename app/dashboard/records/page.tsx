'use client'

import { useState, useMemo, Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BreadcrumbWrapper } from '@/components/ui/breadcrumb-wrapper'
import { DeleteRecordDialog } from '@/components/features/records/delete-record-dialog'
import { type MedicalRecord } from '@/types/record'
import { deleteRecord, getPatients, getRecords } from '@/lib/mock'

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

function RecordsContent() {
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<MedicalRecord | null>(null)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [patientNames, setPatientNames] = useState<Record<string, string>>({})

  useEffect(() => {
    setRecords(getRecords())
    const names: Record<string, string> = {}
    for (const patient of getPatients()) {
      names[patient.id] = patient.nome
    }
    setPatientNames(names)
  }, [])

  // Garantir que os query params sejam preservados na URL após refresh
  useEffect(() => {
    if (patientId && typeof window !== 'undefined') {
      const currentUrl = new URL(window.location.href)
      if (currentUrl.searchParams.get('patientId') !== patientId) {
        currentUrl.searchParams.set('patientId', patientId)
        window.history.replaceState({}, '', currentUrl.toString())
      }
    }
  }, [patientId])

  const filteredRecords = useMemo(() => {
    if (!patientId) {
      return records
    }
    return records.filter((record) => record.patientId === patientId)
  }, [patientId, records])

  const filteredPatientName = patientId ? patientNames[patientId] ?? null : null

  const handleDelete = async () => {
    if (!recordToDelete) return

    try {
      const response = await deleteRecord(recordToDelete.id)

      if (response.ok) {
        setRecords(getRecords())
        setDeleteDialogOpen(false)
        setRecordToDelete(null)
      } else {
        alert(response.error || 'Erro ao excluir prontuário')
      }
    } catch (error) {
      console.error('Erro ao excluir prontuário:', error)
      alert('Erro ao excluir prontuário')
    }
  }

  // Calcular URL do novo prontuário
  const newRecordUrl = (() => {
    const queryParams = new URLSearchParams()
    if (patientId) queryParams.set('patientId', patientId)
    const fromArea = searchParams.get('from')
    if (fromArea) queryParams.set('from', fromArea)
    return `/dashboard/records/new${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  })()

  return (
    <>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-2 sm:mb-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <svg
              className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Prontuários</h1>
            {filteredPatientName && (
              <span className="hidden sm:inline-block px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 whitespace-nowrap">
                Filtrado: {filteredPatientName}
              </span>
            )}
          </div>
          <Link href={newRecordUrl} className="w-full sm:w-auto flex-shrink-0">
            <Button variant="primary" className="flex items-center justify-center gap-2 w-full sm:w-auto">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Novo Prontuário
            </Button>
          </Link>
        </div>
        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-0">
          {filteredPatientName
            ? `Prontuários do paciente ${filteredPatientName}`
            : 'Gerencie todos os prontuários médicos do sistema'}
        </p>
        {filteredPatientName && (
          <div className="sm:hidden mb-3">
            <div className="w-full px-4 py-2 text-base font-medium rounded-full bg-purple-100 text-purple-800">
              Filtrado: {filteredPatientName}
            </div>
          </div>
        )}
      </div>

      {/* Lista de Prontuários */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">
              {filteredPatientName
                ? `Nenhum prontuário encontrado para ${filteredPatientName}.`
                : 'Nenhum prontuário cadastrado.'}
            </p>
          </Card>
        ) : (
          filteredRecords.map((record) => {
            const viewUrl = (() => {
              const queryParams = new URLSearchParams()
              if (patientId) queryParams.set('patientId', patientId)
              const fromArea = searchParams.get('from')
              if (fromArea) queryParams.set('from', fromArea)
              return `/dashboard/records/${record.id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
            })()

            return (
              <Card 
                key={record.id} 
                className="p-4 sm:p-6 relative hover:shadow-md transition-shadow cursor-pointer sm:cursor-default"
              >
                <Link 
                  href={viewUrl}
                  className="absolute inset-0 sm:hidden z-10 pointer-events-auto"
                  aria-label={`Visualizar prontuário: ${record.title}`}
                />
                <div className="flex items-start justify-between relative z-0 sm:z-auto">
                  <div className="flex-1 min-w-0 pointer-events-none sm:pointer-events-auto">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        {record.title}
                      </h3>
                      {!patientId && (
                        <span className="px-2 py-1 text-sm sm:text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {record.patientName}
                        </span>
                      )}
                    </div>
                    <div
                      className="text-sm sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: record.content }}
                    />
                    <div className="flex items-center gap-2 sm:gap-4 text-sm sm:text-xs text-gray-500 flex-wrap">
                      <span>Criado por: {record.createdBy}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{formatDate(record.createdAt)}</span>
                    </div>
                  </div>
                  <div 
                    className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4 flex-shrink-0 relative z-20 pointer-events-auto"
                  >
                    <Link 
                      href={viewUrl}
                      className="hidden sm:block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2"
                        aria-label="Visualizar prontuário"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        Visualizar
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center justify-center gap-1 sm:gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 p-2 sm:p-2 h-10 w-10 sm:h-auto sm:w-auto relative z-30"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setRecordToDelete(record)
                        setDeleteDialogOpen(true)
                      }}
                      aria-label="Excluir prontuário"
                    >
                      <svg
                        className="h-5 w-5 sm:h-4 sm:w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span className="hidden sm:inline">Excluir</span>
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Dialog de Exclusão */}
      {recordToDelete && (
        <DeleteRecordDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          recordTitle={recordToDelete.title}
        />
      )}
    </>
  )
}

export default function RecordsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <BreadcrumbWrapper />

          <Suspense fallback={<div className="text-center py-8">Carregando...</div>}>
            <RecordsContent />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
