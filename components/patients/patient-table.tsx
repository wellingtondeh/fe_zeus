'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { type Patient } from '@/types/patient'
import { deletePatient } from '@/lib/mock'

interface PatientTableProps {
  patients: Patient[]
  onPatientDeleted?: (patientId: string) => void
}

function PatientTableContent({ patients, onPatientDeleted }: PatientTableProps) {
  const searchParams = useSearchParams()
  const fromArea = searchParams.get('from')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)
  const [patientToView, setPatientToView] = useState<Patient | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const itemsPerPage = 10

  // Filtrar pacientes
  const filteredPatients = patients.filter((patient) => {
    const search = searchTerm.toLowerCase()
    return (
      patient.nome.toLowerCase().includes(search) ||
      patient.email?.toLowerCase().includes(search) ||
      patient.telefone.includes(search) ||
      patient.cpf?.includes(search) ||
      patient.endereco.cidade.toLowerCase().includes(search)
    )
  })

  // Paginação
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex)

  // Ajustar página atual se necessário após mudanças na lista
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatPhone = (phone: string) => {
    // Formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    const numbers = phone.replace(/\D/g, '')
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    } else if (numbers.length === 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
    }
    return phone
  }

  const formatCpf = (cpf?: string) => {
    if (!cpf) return '-'
    const numbers = cpf.replace(/\D/g, '')
    if (numbers.length === 11) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`
    }
    return cpf
  }

  return (
    <div className="space-y-4">
      {/* Barra de busca */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
        <div className="w-full sm:w-auto sm:flex-1 max-w-md relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <Input
            type="text"
            placeholder="Buscar por nome, email, telefone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Resetar para primeira página ao buscar
            }}
            className="w-full pl-9 sm:pl-10 text-sm sm:text-base"
          />
        </div>
        <Link href={`/dashboard/patients/new${fromArea ? `?from=${fromArea}` : ''}`} className="w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto flex items-center justify-center gap-2">
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
            <span className="hidden sm:inline">Novo Paciente</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </Link>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle sm:px-0 px-4">
            <table className="w-full" aria-label="Lista de pacientes">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-sm sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-sm sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Email
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-sm sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Telefone
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-sm sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                  CPF
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-sm sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Cidade
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-sm sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedPatients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 sm:px-6 py-8 sm:py-12 text-center text-base sm:text-sm text-gray-500"
                    >
                      {searchTerm
                        ? 'Nenhum paciente encontrado com os filtros aplicados.'
                        : 'Nenhum paciente cadastrado.'}
                    </td>
                  </tr>
                ) : (
                  paginatedPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center">
                          <div className="min-w-0 flex-1">
                            <div className="text-base sm:text-sm font-medium text-gray-900 truncate">
                              {patient.nome}
                            </div>
                            <div className="text-sm sm:text-sm text-gray-500 md:hidden mt-0.5">
                              {patient.email || formatPhone(patient.telefone)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-base sm:text-sm text-gray-500 hidden md:table-cell">
                        <div className="truncate max-w-xs">{patient.email || '-'}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-base sm:text-sm text-gray-500 hidden lg:table-cell">
                        {formatPhone(patient.telefone)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-base sm:text-sm text-gray-500 hidden xl:table-cell">
                        {formatCpf(patient.cpf)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-base sm:text-sm text-gray-500 hidden lg:table-cell">
                        {patient.endereco.cidade}/{patient.endereco.estado}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center justify-center gap-1 sm:gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 sm:p-2 h-10 w-10 sm:h-auto sm:w-auto"
                            aria-label={`Ver detalhes de ${patient.nome}`}
                            onClick={() => {
                              setPatientToView(patient)
                              setViewDialogOpen(true)
                            }}
                          >
                            <svg
                              className="h-5 w-5 sm:h-4 sm:w-4 text-blue-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden="true"
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
                            <span className="hidden sm:inline">Ver</span>
                          </Button>
                          <Link href={`/dashboard/patients/${patient.id}/edit${fromArea ? `?from=${fromArea}` : ''}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center justify-center gap-1 sm:gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 p-2 sm:p-2 h-10 w-10 sm:h-auto sm:w-auto"
                              aria-label={`Editar ${patient.nome}`}
                            >
                              <svg
                                className="h-5 w-5 sm:h-4 sm:w-4 text-green-600"
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
                              <span className="hidden sm:inline">Editar</span>
                            </Button>
                          </Link>
                          <Link href={`/dashboard/records?patientId=${patient.id}${fromArea ? `&from=${fromArea}` : ''}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center justify-center gap-1 sm:gap-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 p-2 sm:p-2 h-10 w-10 sm:h-auto sm:w-auto"
                              aria-label={`Ver prontuários de ${patient.nome}`}
                            >
                              <svg
                                className="h-5 w-5 sm:h-4 sm:w-4 text-purple-600"
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
                              <span className="hidden sm:inline">Prontuários</span>
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center justify-center gap-1 sm:gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 p-2 sm:p-2 h-10 w-10 sm:h-auto sm:w-auto"
                            aria-label={`Excluir ${patient.nome}`}
                            onClick={() => {
                              setPatientToDelete(patient)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <svg
                              className="h-5 w-5 sm:h-4 sm:w-4 text-red-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden="true"
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
              <div className="text-sm sm:text-sm text-gray-700 text-center sm:text-left">
                Mostrando {startIndex + 1} a{' '}
                {Math.min(endIndex, filteredPatients.length)} de{' '}
                {filteredPatients.length} pacientes
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  aria-label="Página anterior"
                  className="px-3 sm:px-4 text-sm sm:text-sm"
                >
                  <span className="hidden sm:inline">Anterior</span>
                  <span className="sm:hidden">Ant</span>
                </Button>
                <span className="text-sm sm:text-sm text-gray-700 px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  aria-label="Próxima página"
                  className="px-3 sm:px-4 text-sm sm:text-sm"
                >
                  <span className="hidden sm:inline">Próxima</span>
                  <span className="sm:hidden">Próx</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dialog de Visualização Rápida */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <Dialog.Content className="max-w-6xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <Dialog.Header>
            <Dialog.Title className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Detalhes do Paciente
            </Dialog.Title>
            <Dialog.Description>
              Informações completas do paciente
            </Dialog.Description>
          </Dialog.Header>
          
          {patientToView && (
            <div className="space-y-4 mt-3">
              {/* Dados Pessoais */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Dados Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <p className="text-sm font-bold text-gray-700">Nome Completo</p>
                    <p className="text-sm text-gray-900 mt-0.5">{patientToView.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">Email</p>
                    <p className="text-sm text-gray-900 mt-0.5">
                      {patientToView.email || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">Telefone</p>
                    <p className="text-sm text-gray-900 mt-0.5">
                      {formatPhone(patientToView.telefone)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">CPF</p>
                    <p className="text-sm text-gray-900 mt-0.5">
                      {formatCpf(patientToView.cpf)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">Data de Nascimento</p>
                    <p className="text-sm text-gray-900 mt-0.5">
                      {formatDate(patientToView.dataNascimento)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">Sexo</p>
                    <p className="text-sm text-gray-900 mt-0.5">
                      {patientToView.sexo === 'M'
                        ? 'Masculino'
                        : patientToView.sexo === 'F'
                          ? 'Feminino'
                          : 'Outro'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                  Endereço
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <p className="text-sm font-bold text-gray-700">CEP</p>
                    <p className="text-sm text-gray-900 mt-0.5">
                      {patientToView.endereco.cep || '-'}
                    </p>
                    <p className="text-sm font-bold text-gray-700 mt-3">Bairro</p>
                    <p className="text-sm text-gray-900 mt-0.5">
                      {patientToView.endereco.bairro}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">Rua</p>
                    <p className="text-sm text-gray-900 mt-0.5">
                      {patientToView.endereco.rua}
                    </p>
                    <p className="text-sm font-bold text-gray-700 mt-3">Cidade</p>
                    <p className="text-sm text-gray-900 mt-0.5">
                      {patientToView.endereco.cidade}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">Número</p>
                    <p className="text-sm text-gray-900 mt-0.5">
                      {patientToView.endereco.numero}
                    </p>
                    <p className="text-sm font-bold text-gray-700 mt-3">Estado (UF)</p>
                    <p className="text-sm text-gray-900 mt-0.5">
                      {patientToView.endereco.estado}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">Complemento</p>
                    <p className="text-sm text-gray-900 mt-0.5">
                      {patientToView.endereco.complemento || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Observações */}
              {patientToView.observacoes && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                    Observações
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-900 whitespace-pre-wrap">
                    {patientToView.observacoes}
                  </p>
                </div>
              )}
            </div>
          )}

          <Dialog.Footer>
            <Button
              variant="outline"
              onClick={() => {
                setViewDialogOpen(false)
                setPatientToView(null)
              }}
              aria-label="Fechar visualização"
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Fechar
            </Button>
            {patientToView && (
              <Link href={`/dashboard/patients/${patientToView.id}/edit${fromArea ? `?from=${fromArea}` : ''}`} className="w-full sm:w-auto">
                <Button variant="primary" aria-label="Editar paciente" className="flex items-center justify-center gap-2 w-full sm:w-auto">
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
              </Link>
            )}
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Content className="max-w-md p-6">
          <Dialog.Header>
            <Dialog.Title className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Confirmar Exclusão
            </Dialog.Title>
            <Dialog.Description>
              Tem certeza que deseja excluir o paciente{' '}
              <strong>{patientToDelete?.nome}</strong>? Esta ação não pode ser
              desfeita.
            </Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setPatientToDelete(null)
              }}
              aria-label="Cancelar exclusão"
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (patientToDelete) {
                  setIsDeleting(true)
                  try {
                    const response = await deletePatient(patientToDelete.id)

                    if (response.ok) {
                      if (onPatientDeleted) {
                        onPatientDeleted(patientToDelete.id)
                      }
                      setDeleteDialogOpen(false)
                      setPatientToDelete(null)
                    } else {
                      alert(response.error || 'Erro ao excluir paciente')
                    }
                  } catch (error) {
                    console.error('Erro ao excluir paciente:', error)
                    alert('Erro ao excluir paciente')
                  } finally {
                    setIsDeleting(false)
                  }
                }
              }}
              disabled={isDeleting}
              aria-label="Confirmar exclusão"
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              {isDeleting ? 'Excluindo...' : 'Sim, excluir'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  )
}

export function PatientTable({ patients, onPatientDeleted }: PatientTableProps) {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <PatientTableContent patients={patients} {...(onPatientDeleted && { onPatientDeleted })} />
    </Suspense>
  )
}
