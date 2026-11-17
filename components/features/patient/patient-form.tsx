'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { patientSchema, type PatientInput } from '@/lib/validations/patient'
import { applyCepMask, removeCepMask, isValidCepFormat } from '@/lib/utils/cep'
import { applyCpfMask, removeCpfMask } from '@/lib/utils/cpf'
import { applyPhoneMask, removePhoneMask } from '@/lib/utils/phone'
import { isValidEmail } from '@/lib/utils/email'
import { createPatient, lookupCep, updatePatient } from '@/lib/mock'

type FormState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success' }

interface PatientFormProps {
  initialData?: PatientInput
  patientId?: string
}

export function PatientForm({ initialData, patientId }: PatientFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formState, setFormState] = useState<FormState>({ status: 'idle' })
  const [formData, setFormData] = useState<PatientInput>(
    initialData || {
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      dataNascimento: '',
      sexo: 'M',
      endereco: {
        cep: '',
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
      },
      observacoes: '',
    }
  )
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof PatientInput | `endereco.${string}`, string>>
  >({})
  const [cepLoading, setCepLoading] = useState(false)
  const [cepFilledFields, setCepFilledFields] = useState<Set<string>>(new Set())

  // Inicializar campos preenchidos pelo CEP quando houver dados iniciais
  useEffect(() => {
    if (initialData?.endereco) {
      const filledFields = new Set<string>()
      if (initialData.endereco.rua) filledFields.add('rua')
      if (initialData.endereco.bairro) filledFields.add('bairro')
      if (initialData.endereco.cidade) filledFields.add('cidade')
      if (initialData.endereco.estado) filledFields.add('estado')
      setCepFilledFields(filledFields)
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})
    setFormState({ status: 'loading' })

    // Preparar dados para envio (remover máscaras)
    const dataToSubmit = {
      ...formData,
      telefone: removePhoneMask(formData.telefone),
      cpf: formData.cpf ? removeCpfMask(formData.cpf) : '',
      endereco: {
        ...formData.endereco,
        cep: formData.endereco.cep && formData.endereco.cep.length > 0
          ? removeCepMask(formData.endereco.cep)
          : '',
      },
    }

    // Validação client-side
    const result = patientSchema.safeParse(dataToSubmit)
    if (!result.success) {
      const errors: Partial<Record<string, string>> = {}
      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.')
        errors[path] = issue.message
      })
      setFieldErrors(errors)
      setFormState({
        status: 'error',
        error: 'Por favor, corrija os erros acima',
      })
      return
    }

    startTransition(async () => {
      try {
        const data = patientId
          ? await updatePatient(patientId, dataToSubmit)
          : await createPatient(dataToSubmit)

        if (!data.ok) {
          if (data.issues) {
            const errors: Partial<Record<string, string>> = {}
            data.issues.forEach((issue) => {
              errors[issue.field] = issue.message
            })
            setFieldErrors(errors)
            setFormState({
              status: 'error',
              error: 'Por favor, corrija os erros acima',
            })
          } else {
            setFormState({
              status: 'error',
              error: data.error || 'Erro ao cadastrar paciente. Tente novamente.',
            })
          }
          return
        }

        setFormState({ status: 'success' })
        // Redirecionar após cadastro/edição bem-sucedida
        setTimeout(() => {
          router.push('/dashboard/patients')
        }, 1500)
      } catch (error) {
        console.error('Erro ao cadastrar paciente:', error)
        setFormState({
          status: 'error',
          error: 'Erro de conexão. Verifique sua internet e tente novamente.',
        })
      }
    })
  }

  const handleInputChange = (field: keyof PatientInput) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (field === 'endereco') {
      // Não deve acontecer, mas TypeScript precisa disso
      return
    }
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    if (formState.status === 'error') {
      setFormState({ status: 'idle' })
    }
  }

  const handleAddressChange = (field: keyof PatientInput['endereco']) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      endereco: { ...prev.endereco, [field]: e.target.value },
    }))
    const addressField = `endereco.${field}` as const
    if (fieldErrors[addressField]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[addressField]
        return newErrors
      })
    }
    if (formState.status === 'error') {
      setFormState({ status: 'idle' })
    }
  }

  const handleEmailBlur = () => {
    const email = (formData.email || '').trim()
    
    // Se o campo não estiver vazio, validar email
    if (email && !isValidEmail(email)) {
      setFieldErrors((prev) => ({
        ...prev,
        email: 'Email inválido. Digite um email válido.',
      }))
    } else if (email && isValidEmail(email)) {
      // Limpar erro se o email for válido
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.email
        return newErrors
      })
    }
  }

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyCepMask(e.target.value)
    const currentCep = formData.endereco.cep || ''
    
    // Se o CEP foi alterado (limpo ou modificado), reabilitar campos
    if (maskedValue.length < currentCep.length) {
      setCepFilledFields(new Set())
    }
    
    setFormData((prev) => ({
      ...prev,
      endereco: { ...prev.endereco, cep: maskedValue },
    }))
    if (fieldErrors['endereco.cep']) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors['endereco.cep']
        return newErrors
      })
    }
  }

  const handleCepBlur = async () => {
    const cep = formData.endereco.cep || ''
    const cepWithoutMask = removeCepMask(cep)
    
    if (!isValidCepFormat(cep)) {
      if (cep) {
        setFieldErrors((prev) => ({
          ...prev,
          'endereco.cep': 'CEP inválido. Digite 8 dígitos.',
        }))
      }
      return
    }

    setCepLoading(true)
    try {
      const result = await lookupCep(cepWithoutMask)

      if (!result.ok) {
        setFieldErrors((prev) => ({
          ...prev,
          'endereco.cep': result.error || 'Erro ao buscar CEP.',
        }))
        return
      }

      const data = result.data

      // Identificar quais campos foram preenchidos pelo CEP
      const filledFields = new Set<string>()
      if (data.logradouro) filledFields.add('rua')
      if (data.bairro) filledFields.add('bairro')
      if (data.localidade) filledFields.add('cidade')
      if (data.uf) filledFields.add('estado')

      // Preencher campos automaticamente
      setFormData((prev) => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          cep: applyCepMask(data.cep || prev.endereco.cep),
          rua: data.logradouro || prev.endereco.rua,
          bairro: data.bairro || prev.endereco.bairro,
          cidade: data.localidade || prev.endereco.cidade,
          estado: data.uf || prev.endereco.estado,
          complemento: data.complemento || prev.endereco.complemento,
        },
      }))

      // Atualizar campos preenchidos pelo CEP
      setCepFilledFields(filledFields)

      // Limpar erros dos campos preenchidos
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors['endereco.rua']
        delete newErrors['endereco.bairro']
        delete newErrors['endereco.cidade']
        delete newErrors['endereco.estado']
        delete newErrors['endereco.cep']
        return newErrors
      })
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      setFieldErrors((prev) => ({
        ...prev,
        'endereco.cep': 'Erro ao buscar CEP. Tente novamente.',
      }))
    } finally {
      setCepLoading(false)
    }
  }

  const isLoading = isPending || formState.status === 'loading'
  const hasError = formState.status === 'error'

  return (
    <Card className="w-full">
      <Card.Header>
        <Card.Title>
          {patientId ? 'Editar Paciente' : 'Cadastrar Novo Paciente'}
        </Card.Title>
        <Card.Description>
          {patientId
            ? 'Edite os dados do paciente abaixo'
            : 'Preencha os dados abaixo para cadastrar um novo paciente no sistema'}
        </Card.Description>
      </Card.Header>

      <Card.Content>
        <form onSubmit={handleSubmit} noValidate aria-label="Formulário de cadastro de paciente">
          <div className="space-y-6">
            {/* Dados Pessoais */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Dados Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  label="Nome Completo"
                  placeholder="João Silva"
                  value={formData.nome}
                  onChange={handleInputChange('nome')}
                  {...(fieldErrors.nome && { error: fieldErrors.nome })}
                  required
                  autoComplete="name"
                />

                <Input
                  type="email"
                  label="Email"
                  placeholder="joao@email.com"
                  value={formData.email || ''}
                  onChange={handleInputChange('email')}
                  onBlur={handleEmailBlur}
                  {...(fieldErrors.email && { error: fieldErrors.email })}
                  autoComplete="email"
                />

                <Input
                  type="tel"
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => {
                    const maskedValue = applyPhoneMask(e.target.value)
                    setFormData((prev) => ({ ...prev, telefone: maskedValue }))
                    if (fieldErrors.telefone) {
                      setFieldErrors((prev) => {
                        const newErrors = { ...prev }
                        delete newErrors.telefone
                        return newErrors
                      })
                    }
                    if (formState.status === 'error') {
                      setFormState({ status: 'idle' })
                    }
                  }}
                  {...(fieldErrors.telefone && { error: fieldErrors.telefone })}
                  required
                  autoComplete="tel"
                  maxLength={15}
                />

                <Input
                  type="text"
                  label="CPF"
                  placeholder="000.000.000-00"
                  value={formData.cpf || ''}
                  onChange={(e) => {
                    const maskedValue = applyCpfMask(e.target.value)
                    setFormData((prev) => ({ ...prev, cpf: maskedValue }))
                    if (fieldErrors.cpf) {
                      setFieldErrors((prev) => {
                        const newErrors = { ...prev }
                        delete newErrors.cpf
                        return newErrors
                      })
                    }
                    if (formState.status === 'error') {
                      setFormState({ status: 'idle' })
                    }
                  }}
                  {...(fieldErrors.cpf && { error: fieldErrors.cpf })}
                  autoComplete="off"
                  maxLength={14}
                />

                <Input
                  type="date"
                  label="Data de Nascimento"
                  value={formData.dataNascimento}
                  onChange={handleInputChange('dataNascimento')}
                  {...(fieldErrors.dataNascimento && { error: fieldErrors.dataNascimento })}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Sexo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.sexo}
                    onChange={handleInputChange('sexo')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    required
                    aria-invalid={!!fieldErrors.sexo}
                    aria-describedby={fieldErrors.sexo ? 'sexo-error' : undefined}
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                  {fieldErrors.sexo && (
                    <p
                      id="sexo-error"
                      className="mt-1.5 text-sm text-red-600"
                      role="alert"
                    >
                      {fieldErrors.sexo}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Endereço
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    type="text"
                    label="CEP"
                    placeholder="00000-000"
                    value={formData.endereco.cep || ''}
                    onChange={handleCepChange}
                    onBlur={handleCepBlur}
                    {...(fieldErrors['endereco.cep'] && { error: fieldErrors['endereco.cep'] })}
                    autoComplete="postal-code"
                    maxLength={9}
                    disabled={cepLoading}
                  />
                  {cepLoading && (
                    <p className="mt-1.5 text-sm text-gray-500">
                      Buscando endereço...
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <div className="relative">
                    <Input
                      type="text"
                      label="Rua"
                      placeholder="Rua das Flores"
                      value={formData.endereco.rua}
                      onChange={handleAddressChange('rua')}
                      {...(fieldErrors['endereco.rua'] && { error: fieldErrors['endereco.rua'] })}
                      required
                      autoComplete="street-address"
                      disabled={cepFilledFields.has('rua')}
                    />
                    {cepFilledFields.has('rua') && (
                      <button
                        type="button"
                        onClick={() => {
                          setCepFilledFields((prev) => {
                            const newSet = new Set(prev)
                            newSet.delete('rua')
                            return newSet
                          })
                        }}
                        className="absolute right-3 top-[2.125rem] text-xs text-blue-600 hover:text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                        aria-label="Permitir edição do campo Rua"
                      >
                        Editar
                      </button>
                    )}
                  </div>
                </div>

                <Input
                  type="text"
                  label="Número"
                  placeholder="123"
                  value={formData.endereco.numero}
                  onChange={handleAddressChange('numero')}
                  {...(fieldErrors['endereco.numero'] && { error: fieldErrors['endereco.numero'] })}
                  required
                />

                <Input
                  type="text"
                  label="Complemento"
                  placeholder="Apto 101"
                  value={formData.endereco.complemento || ''}
                  onChange={handleAddressChange('complemento')}
                  {...(fieldErrors['endereco.complemento'] && { error: fieldErrors['endereco.complemento'] })}
                />

                <div className="relative">
                  <Input
                    type="text"
                    label="Bairro"
                    placeholder="Centro"
                    value={formData.endereco.bairro}
                    onChange={handleAddressChange('bairro')}
                    {...(fieldErrors['endereco.bairro'] && { error: fieldErrors['endereco.bairro'] })}
                    required
                    disabled={cepFilledFields.has('bairro')}
                  />
                  {cepFilledFields.has('bairro') && (
                    <button
                      type="button"
                      onClick={() => {
                        setCepFilledFields((prev) => {
                          const newSet = new Set(prev)
                          newSet.delete('bairro')
                          return newSet
                        })
                      }}
                      className="absolute right-3 top-[2.125rem] text-xs text-blue-600 hover:text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                      aria-label="Permitir edição do campo Bairro"
                    >
                      Editar
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Input
                    type="text"
                    label="Cidade"
                    placeholder="São Paulo"
                    value={formData.endereco.cidade}
                    onChange={handleAddressChange('cidade')}
                    {...(fieldErrors['endereco.cidade'] && { error: fieldErrors['endereco.cidade'] })}
                    required
                    disabled={cepFilledFields.has('cidade')}
                  />
                  {cepFilledFields.has('cidade') && (
                    <button
                      type="button"
                      onClick={() => {
                        setCepFilledFields((prev) => {
                          const newSet = new Set(prev)
                          newSet.delete('cidade')
                          return newSet
                        })
                      }}
                      className="absolute right-3 top-[2.125rem] text-xs text-blue-600 hover:text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                      aria-label="Permitir edição do campo Cidade"
                    >
                      Editar
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Input
                    type="text"
                    label="Estado (UF)"
                    placeholder="SP"
                    value={formData.endereco.estado}
                    onChange={handleAddressChange('estado')}
                    {...(fieldErrors['endereco.estado'] && { error: fieldErrors['endereco.estado'] })}
                    required
                    maxLength={2}
                    autoComplete="off"
                    disabled={cepFilledFields.has('estado')}
                  />
                  {cepFilledFields.has('estado') && (
                    <button
                      type="button"
                      onClick={() => {
                        setCepFilledFields((prev) => {
                          const newSet = new Set(prev)
                          newSet.delete('estado')
                          return newSet
                        })
                      }}
                      className="absolute right-3 top-[2.125rem] text-xs text-blue-600 hover:text-blue-700 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
                      aria-label="Permitir edição do campo Estado"
                    >
                      Editar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Observações
              </label>
              <textarea
                value={formData.observacoes}
                onChange={handleInputChange('observacoes')}
                rows={4}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Informações adicionais sobre o paciente..."
                aria-invalid={!!fieldErrors.observacoes}
                aria-describedby={fieldErrors.observacoes ? 'observacoes-error' : undefined}
              />
              {fieldErrors.observacoes && (
                <p
                  id="observacoes-error"
                  className="mt-1.5 text-sm text-red-600"
                  role="alert"
                >
                  {fieldErrors.observacoes}
                </p>
              )}
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
                      {patientId
                        ? 'Paciente atualizado com sucesso!'
                        : 'Paciente cadastrado com sucesso!'}
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
                {patientId ? 'Salvar Alterações' : 'Cadastrar Paciente'}
              </Button>
            </div>
          </div>
        </form>
      </Card.Content>
    </Card>
  )
}
