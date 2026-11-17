'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth'
import { forgotPassword } from '@/lib/mock'

type ForgotPasswordState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success' }

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [formState, setFormState] = useState<ForgotPasswordState>({ status: 'idle' })
  const [formData, setFormData] = useState<ForgotPasswordInput>({
    email: '',
  })
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ForgotPasswordInput, string>>
  >({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})
    setFormState({ status: 'loading' })

    // Validação client-side
    const result = forgotPasswordSchema.safeParse(formData)
    if (!result.success) {
      const errors: Partial<Record<keyof ForgotPasswordInput, string>> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ForgotPasswordInput
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
        const data = await forgotPassword(result.data.email)

        if (!data.ok) {
          if (data.issues) {
            const errors: Partial<Record<keyof ForgotPasswordInput, string>> = {}
            data.issues.forEach((issue) => {
              const field = issue.field as keyof ForgotPasswordInput
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
              error:
                data.error ||
                'Erro ao solicitar recuperação de senha. Tente novamente.',
            })
          }
          return
        }

        setFormState({ status: 'success' })
      } catch (error) {
        console.error('Erro ao solicitar recuperação de senha:', error)
        setFormState({
          status: 'error',
          error: 'Erro de conexão. Verifique sua internet e tente novamente.',
        })
      }
    })
  }

  const handleInputChange = (field: keyof ForgotPasswordInput) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
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
  const isSuccess = formState.status === 'success'

  return (
    <Card className="w-full">
      <Card.Header>
        <Card.Title>Esqueceu sua senha?</Card.Title>
        <Card.Description>
          Digite seu email e enviaremos um link para redefinir sua senha
        </Card.Description>
      </Card.Header>

      <Card.Content>
        {isSuccess ? (
          <div className="space-y-4">
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
                    Email enviado com sucesso!
                  </p>
                  <p className="mt-2 text-sm text-green-700">
                    Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Link href="/login">
                <Button variant="primary" className="w-full">
                  Voltar para o login
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate aria-label="Formulário de recuperação de senha">
            <div className="space-y-4">
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
                aria-describedby={hasError ? 'forgot-password-error' : undefined}
              >
                Enviar link de recuperação
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Lembrou sua senha?{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              Voltar para o login
            </Link>
          </p>
        </div>
      </Card.Content>
    </Card>
  )
}
