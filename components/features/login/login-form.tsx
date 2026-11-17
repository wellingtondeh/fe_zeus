'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Divider } from '@/components/ui/divider'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { login, startSso, type SsoProvider } from '@/lib/mock'

type LoginState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success' }

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [formState, setFormState] = useState<LoginState>({ status: 'idle' })
  const [formData, setFormData] = useState<LoginInput>({
    email: 'admin@admin.com',
    password: 'admin1234',
  })
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginInput, string>>
  >({})
  const [ssoLoading, setSsoLoading] = useState<string | null>(null)

  // Ler erros da URL (vindos dos callbacks SSO) e mensagens de sucesso
  useEffect(() => {
    const error = searchParams.get('error')
    const registered = searchParams.get('registered')
    
    if (error) {
      setFormState({
        status: 'error',
        error: decodeURIComponent(error),
      })
      // Limpar o parâmetro da URL sem recarregar a página
      router.replace('/login', { scroll: false })
    } else if (registered === 'true') {
      setFormState({
        status: 'success',
      })
      // Limpar o parâmetro da URL sem recarregar a página
      router.replace('/login', { scroll: false })
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})
    // Limpar estado de sucesso se existir (vindo do cadastro)
    if (formState.status === 'success') {
      setFormState({ status: 'idle' })
    }
    setFormState({ status: 'loading' })

    // Validação client-side
    const result = loginSchema.safeParse(formData)
    if (!result.success) {
      const errors: Partial<Record<keyof LoginInput, string>> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginInput
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
        const data = await login(result.data.email, result.data.password)

        if (!data.ok) {
          if (data.issues) {
            const errors: Partial<Record<keyof LoginInput, string>> = {}
            data.issues.forEach((issue) => {
              const field = issue.field as keyof LoginInput
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
              error: data.error || 'Erro ao fazer login. Tente novamente.',
            })
          }
          return
        }

        router.push('/dashboard')
      } catch (error) {
        console.error('Erro ao fazer login:', error)
        setFormState({
          status: 'error',
          error: 'Erro de conexão. Verifique sua internet e tente novamente.',
        })
      }
    })
  }

  const handleInputChange = (field: keyof LoginInput) => (
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
    // Limpar erro ou sucesso quando o usuário começar a digitar
    if (formState.status === 'error' || formState.status === 'success') {
      setFormState({ status: 'idle' })
    }
  }

  const handleSSO = (provider: SsoProvider) => {
    setSsoLoading(provider)
    startSso(provider)
  }

  const isLoading = isPending || formState.status === 'loading'
  const hasError = formState.status === 'error'

  return (
    <Card className="w-full">
      <Card.Header>
        <Card.Title>Entrar</Card.Title>
        <Card.Description>
          Acesse sua conta ou use SSO para entrar rapidamente
        </Card.Description>
      </Card.Header>

      <Card.Content>
        <form onSubmit={handleSubmit} noValidate aria-label="Formulário de login">
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

            <div>
              <Input
                type="password"
                label="Senha"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange('password')}
                {...(fieldErrors.password && { error: fieldErrors.password })}
                required
                autoComplete="current-password"
                aria-describedby={
                  fieldErrors.password
                    ? 'password-error'
                    : 'password-description'
                }
                aria-invalid={!!fieldErrors.password}
              />
              <div className="mt-2 flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
                <a
                  href="/register"
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  Cadastre-se
                </a>
                <a
                  href="/forgot-password"
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  Esqueceu sua senha?
                </a>
              </div>
            </div>

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
                      Cadastro realizado com sucesso! Faça login para continuar.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
              aria-describedby={hasError ? 'login-error' : undefined}
            >
              Entrar
            </Button>
          </div>
        </form>

        <Divider className="my-6">OU</Divider>

        <div className="space-y-3">
          <Button
            type="button"
            variant="google"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => handleSSO('google')}
            disabled={!!ssoLoading}
            aria-label="Entrar com Google"
          >
            {ssoLoading === 'google' ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continuar com Google</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="microsoft"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => handleSSO('microsoft')}
            disabled={!!ssoLoading}
            aria-label="Entrar com Microsoft"
          >
            {ssoLoading === 'microsoft' ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 23 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M0 0H10.4V10.4H0V0Z"
                    fill="#F25022"
                  />
                  <path
                    d="M12.6 0H23V10.4H12.6V0Z"
                    fill="#7FBA00"
                  />
                  <path
                    d="M0 12.6H10.4V23H0V12.6Z"
                    fill="#00A4EF"
                  />
                  <path
                    d="M12.6 12.6H23V23H12.6V12.6Z"
                    fill="#FFB900"
                  />
                </svg>
                <span>Continuar com Microsoft</span>
              </>
            )}
          </Button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              type="button"
              variant="facebook"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => handleSSO('facebook')}
              disabled={!!ssoLoading}
              aria-label="Entrar com Facebook"
            >
              {ssoLoading === 'facebook' ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="hidden sm:inline">Facebook</span>
                  <span className="sm:hidden">FB</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-pink-300 text-pink-700 hover:bg-pink-50"
              onClick={() => handleSSO('instagram')}
              disabled={!!ssoLoading}
              aria-label="Entrar com Instagram"
            >
              {ssoLoading === 'instagram' ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span className="hidden sm:inline">Instagram</span>
                  <span className="sm:hidden">IG</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Card.Content>
    </Card>
  )
}
