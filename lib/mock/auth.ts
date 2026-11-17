import { loginSchema, registerSchema, forgotPasswordSchema } from '@/lib/validations/auth'
import { getSsoBaseUrl } from './config'
import {
  getAuthSession,
  getUsers,
  saveUsers,
  setAuthSession,
} from './store'
import type { MockApiResult } from './types'

function delay(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function login(
  email: string,
  password: string
): Promise<MockApiResult<{ email: string; name: string }>> {
  await delay()

  const parsed = loginSchema.safeParse({ email, password })
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      error: 'Dados inválidos',
      code: 'VALIDATION_ERROR',
      issues: parsed.error.issues.map((issue) => ({
        field: String(issue.path[0] ?? ''),
        message: issue.message,
      })),
    }
  }

  const user = getUsers().find(
    (u) =>
      u.email.toLowerCase() === parsed.data.email.toLowerCase() &&
      u.password === parsed.data.password
  )

  if (!user) {
    return {
      ok: false,
      status: 401,
      error: 'Email ou senha incorretos',
      code: 'INVALID_CREDENTIALS',
    }
  }

  setAuthSession({ email: user.email, name: user.name })
  return {
    ok: true,
    data: { email: user.email, name: user.name },
    message: 'Login realizado com sucesso',
  }
}

export async function register(input: {
  name: string
  email: string
  document: string
  password: string
  confirmPassword: string
}): Promise<MockApiResult<{ email: string }>> {
  await delay()

  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      error: 'Dados inválidos',
      code: 'VALIDATION_ERROR',
      issues: parsed.error.issues.map((issue) => ({
        field: String(issue.path[0] ?? ''),
        message: issue.message,
      })),
    }
  }

  const documentNumbers = parsed.data.document.replace(/\D/g, '')
  if (documentNumbers.length !== 11 && documentNumbers.length !== 14) {
    return {
      ok: false,
      status: 400,
      error: 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos',
      code: 'INVALID_DOCUMENT',
    }
  }

  const users = getUsers()
  if (users.some((u) => u.email.toLowerCase() === parsed.data.email.toLowerCase())) {
    return {
      ok: false,
      status: 409,
      error: 'Email já cadastrado',
      code: 'EMAIL_EXISTS',
    }
  }

  users.push({
    email: parsed.data.email,
    password: parsed.data.password,
    name: parsed.data.name,
  })
  saveUsers(users)

  return {
    ok: true,
    data: { email: parsed.data.email },
    message: 'Cadastro realizado com sucesso',
  }
}

export async function forgotPassword(
  email: string
): Promise<MockApiResult<{ sent: true }>> {
  await delay()

  const parsed = forgotPasswordSchema.safeParse({ email })
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      error: 'Dados inválidos',
      code: 'VALIDATION_ERROR',
      issues: parsed.error.issues.map((issue) => ({
        field: String(issue.path[0] ?? ''),
        message: issue.message,
      })),
    }
  }

  // Sempre sucesso (evita enumeração de emails), como no mock antigo
  return {
    ok: true,
    data: { sent: true },
    message:
      'Se o email existir em nosso sistema, você receberá um link de recuperação.',
  }
}

export type SsoProvider = 'google' | 'microsoft' | 'facebook' | 'instagram'

/**
 * SSO real virá de outro serviço (NEXT_PUBLIC_SSO_BASE_URL).
 * Sem URL configurada, simula login e segue para o dashboard.
 */
export function startSso(provider: SsoProvider): void {
  const base = getSsoBaseUrl()
  if (base) {
    const url = `${base.replace(/\/$/, '')}/${provider}`
    window.location.href = url
    return
  }

  setAuthSession({
    email: `${provider}@sso.mock`,
    name: `Usuário ${provider}`,
  })
  window.location.href = '/dashboard'
}

export function logout(): void {
  setAuthSession(null)
}

export function getSession() {
  return getAuthSession()
}
