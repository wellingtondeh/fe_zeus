'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { RichTextEditor } from './rich-text-editor'
import { RecordFileUpload } from './record-file-upload'
import { type MedicalRecordInput } from '@/types/record'
import { createRecord, listPatients, updateRecord } from '@/lib/mock'

type FormState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success' }

interface RecordFormProps {
  initialData?: MedicalRecordInput & { id?: string }
  recordId?: string
}

export function RecordForm({ initialData, recordId }: RecordFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [formState, setFormState] = useState<FormState>({ status: 'idle' })
  const [formData, setFormData] = useState<MedicalRecordInput>(
    initialData || {
      patientId: '',
      title: '',
      content: '',
    }
  )
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof MedicalRecordInput, string>>
  >({})
  const [attachments, setAttachments] = useState<File[]>([])
  const [mockPatients, setMockPatients] = useState<{ id: string; nome: string }[]>(
    []
  )

  useEffect(() => {
    void listPatients().then((result) => {
      if (result.ok) {
        setMockPatients(result.data.map((p) => ({ id: p.id, nome: p.nome })))
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})
    setFormState({ status: 'loading' })

    // Validação básica
    if (!formData.patientId) {
      setFieldErrors({ patientId: 'Selecione um paciente' })
      setFormState({ status: 'error', error: 'Por favor, preencha todos os campos obrigatórios' })
      return
    }

    if (!formData.title.trim()) {
      setFieldErrors({ title: 'Título é obrigatório' })
      setFormState({ status: 'error', error: 'Por favor, preencha todos os campos obrigatórios' })
      return
    }

    if (!formData.content.trim()) {
      setFieldErrors({ content: 'Conteúdo é obrigatório' })
      setFormState({ status: 'error', error: 'Por favor, preencha todos os campos obrigatórios' })
      return
    }

    startTransition(async () => {
      try {
        const payload = {
          patientId: formData.patientId,
          title: formData.title,
          content: formData.content,
          attachments,
        }
        const data = recordId
          ? await updateRecord(recordId, payload)
          : await createRecord(payload)

        if (!data.ok) {
          setFormState({
            status: 'error',
            error: data.error || 'Erro ao salvar prontuário. Tente novamente.',
          })
          return
        }

        setFormState({ status: 'success' })
        setTimeout(() => {
          const queryParams = new URLSearchParams()
          const patientId = searchParams.get('patientId')
          const fromArea = searchParams.get('from')
          if (patientId) queryParams.set('patientId', patientId)
          if (fromArea) queryParams.set('from', fromArea)
          router.push(`/dashboard/records${queryParams.toString() ? `?${queryParams.toString()}` : ''}`)
        }, 1500)
      } catch (error) {
        console.error('Erro ao salvar prontuário:', error)
        setFormState({
          status: 'error',
          error: 'Erro de conexão. Verifique sua internet e tente novamente.',
        })
      }
    })
  }

  const isLoading = isPending || formState.status === 'loading'
  const hasError = formState.status === 'error'

  return (
    <Card className="w-full">
      <Card.Header>
        <Card.Title className="flex items-center gap-2">
          {recordId ? (
            <>
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Editar Prontuário
            </>
          ) : (
            <>
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Novo Prontuário
            </>
          )}
        </Card.Title>
        <Card.Description>
          {recordId
            ? 'Edite as informações do prontuário abaixo'
            : 'Preencha os dados abaixo para criar um novo prontuário'}
        </Card.Description>
      </Card.Header>

      <Card.Content>
        <form onSubmit={handleSubmit} noValidate aria-label="Formulário de prontuário">
          <div className="space-y-6">
            {/* Seleção de Paciente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Paciente <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.patientId}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, patientId: e.target.value }))
                  if (fieldErrors.patientId) {
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev }
                      delete newErrors.patientId
                      return newErrors
                    })
                  }
                }}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                required
                aria-invalid={!!fieldErrors.patientId}
                aria-describedby={fieldErrors.patientId ? 'patientId-error' : undefined}
              >
                <option value="">Selecione um paciente</option>
                {mockPatients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.nome}
                  </option>
                ))}
              </select>
              {fieldErrors.patientId && (
                <p
                  id="patientId-error"
                  className="mt-1.5 text-sm text-red-600"
                  role="alert"
                >
                  {fieldErrors.patientId}
                </p>
              )}
            </div>

            {/* Título */}
            <Input
              type="text"
              label="Título"
              placeholder="Ex: Consulta Inicial"
              value={formData.title}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, title: e.target.value }))
                if (fieldErrors.title) {
                  setFieldErrors((prev) => {
                    const newErrors = { ...prev }
                    delete newErrors.title
                    return newErrors
                  })
                }
              }}
              {...(fieldErrors.title && { error: fieldErrors.title })}
              required
            />

            {/* Conteúdo e anexos: coluna única no mobile; lado a lado em lg+ */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6 lg:items-start">
              <div className="lg:col-span-8 min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-gray-600"
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
                  Conteúdo <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => {
                    setFormData((prev) => ({ ...prev, content: value }))
                    if (fieldErrors.content) {
                      setFieldErrors((prev) => {
                        const newErrors = { ...prev }
                        delete newErrors.content
                        return newErrors
                      })
                    }
                  }}
                  placeholder="Digite o conteúdo do prontuário..."
                />
                {fieldErrors.content && (
                  <p className="mt-1.5 text-sm text-red-600" role="alert">
                    {fieldErrors.content}
                  </p>
                )}
              </div>

              <aside className="mb-0 mt-0 min-w-0 lg:col-span-4">
                <RecordFileUpload
                  files={attachments}
                  onAddFiles={(newFiles) =>
                    setAttachments((prev) => [...prev, ...newFiles])
                  }
                  onRemoveAt={(index) =>
                    setAttachments((prev) => prev.filter((_, i) => i !== index))
                  }
                  disabled={isLoading}
                />
              </aside>
            </div>

            {/* Mensagem de Erro */}
            {hasError && formState.status === 'error' && (
              <div
                role="alert"
                aria-live="assertive"
                className="rounded-md bg-red-50 p-4 border border-red-200"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">
                      {formState.error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mensagem de Sucesso */}
            {formState.status === 'success' && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-md bg-green-50 p-4 border border-green-200"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      {recordId
                        ? 'Prontuário atualizado com sucesso!'
                        : 'Prontuário criado com sucesso!'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
                className="flex items-center gap-2"
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
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? null : (
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                {recordId ? 'Salvar Alterações' : 'Criar Prontuário'}
              </Button>
            </div>
          </div>
        </form>
      </Card.Content>
    </Card>
  )
}
