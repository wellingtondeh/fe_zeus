'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { applyCpfMask } from '@/lib/utils/cpf'
import { applyCnpjMask } from '@/lib/utils/cnpj'
import { register } from '@/lib/mock'

type RegisterState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success' }

export function RegisterForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formState, setFormState] = useState<RegisterState>({ status: 'idle' })
  const [formData, setFormData] = useState<RegisterInput>({
    name: '',
    email: '',
    document: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterInput, string>>
  >({})
  const [documentType, setDocumentType] = useState<'cpf' | 'cnpj'>('cpf')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})
    setFormState({ status: 'loading' })

    // Validação client-side
    const result = registerSchema.safeParse(formData)
    if (!result.success) {
      const errors: Partial<Record<keyof RegisterInput, string>> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RegisterInput
        if (field) {
          errors[field] = issue.message
        }
      })
      setFieldErrors(errors)
      setFormState({ status: 'error', error: 'Por favor, corrija os erros acima' })
      return
    }

    startTransition(async () => {
      try {
        const data = await register(result.data)

        if (!data.ok) {
          if (data.issues) {
            const errors: Partial<Record<keyof RegisterInput, string>> = {}
            data.issues.forEach((issue) => {
              const field = issue.field as keyof RegisterInput
              if (field) {
                errors[field] = issue.message
              }
            })
            setFieldErrors(errors)
            setFormState({
              status: 'error',
              error: 'Por favor, corrija os erros acima',
            })
          } else {
            setFormState({
              status: 'error',
              error: data.error || 'Erro ao criar conta. Tente novamente.',
            })
          }
          return
        }

        setFormState({ status: 'success' })
        router.push('/login?registered=true')
      } catch (error) {
        console.error('Erro ao criar conta:', error)
        setFormState({
          status: 'error',
          error: 'Erro de conexão. Verifique sua internet e tente novamente.',
        })
      }
    })
  }

  const handleInputChange = (field: keyof RegisterInput) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = e.target.value

    // Aplicar máscara para CPF/CNPJ
    if (field === 'document') {
      const numbers = value.replace(/\D/g, '')
      if (numbers.length <= 11) {
        setDocumentType('cpf')
        value = applyCpfMask(value)
      } else {
        setDocumentType('cnpj')
        value = applyCnpjMask(value)
      }
    }

    setFormData((prev) => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando o usuário começar a digitar
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    // Limpar erro geral quando o usuário começar a digitar
    if (formState.status === 'error') {
      setFormState({ status: 'idle' })
    }
  }

  const isLoading = isPending || formState.status === 'loading'
  const hasError = formState.status === 'error'

  return (
    <Card className="w-full">
      <Card.Header>
        <Card.Title>Cadastre-se</Card.Title>
        <Card.Description>
          Crie sua conta para acessar o sistema
        </Card.Description>
      </Card.Header>

      <Card.Content>
        <form onSubmit={handleSubmit} noValidate aria-label="Formulário de cadastro">
          <div className="space-y-4">
            <Input
              type="text"
              label="Nome completo"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={handleInputChange('name')}
              {...(fieldErrors.name && { error: fieldErrors.name })}
              required
              autoComplete="name"
              aria-describedby={
                fieldErrors.name ? 'name-error' : 'name-description'
              }
              aria-invalid={!!fieldErrors.name}
            />

            <Input
              type="email"
              label="Email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleInputChange('email')}
              {...(fieldErrors.email && { error: fieldErrors.email })}
              required
              autoComplete="email"
              aria-describedby={
                fieldErrors.email ? 'email-error' : 'email-description'
              }
              aria-invalid={!!fieldErrors.email}
            />

            <Input
              type="text"
              label={documentType === 'cpf' ? 'CPF' : 'CNPJ'}
              placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
              value={formData.document}
              onChange={handleInputChange('document')}
              {...(fieldErrors.document && { error: fieldErrors.document })}
              required
              aria-describedby={
                fieldErrors.document ? 'document-error' : 'document-description'
              }
              aria-invalid={!!fieldErrors.document}
            />

            <Input
              type="password"
              label="Senha"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange('password')}
              {...(fieldErrors.password && { error: fieldErrors.password })}
              required
              autoComplete="new-password"
              aria-describedby={
                fieldErrors.password
                  ? 'password-error'
                  : 'password-description'
              }
              aria-invalid={!!fieldErrors.password}
            />

            <Input
              type="password"
              label="Confirmar senha"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              {...(fieldErrors.confirmPassword && {
                error: fieldErrors.confirmPassword,
              })}
              required
              autoComplete="new-password"
              aria-describedby={
                fieldErrors.confirmPassword
                  ? 'confirmPassword-error'
                  : 'confirmPassword-description'
              }
              aria-invalid={!!fieldErrors.confirmPassword}
            />

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

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
              aria-describedby={hasError ? 'register-error' : undefined}
            >
              Cadastrar
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              Entrar
            </Link>
          </p>
        </div>
      </Card.Content>
    </Card>
  )
}
