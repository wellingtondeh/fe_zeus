import { NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'
import { loginSchema } from '@/lib/validations/auth'

const limiter = rateLimit({
  interval: 60 * 1000, // 60 segundos
  uniqueTokenPerInterval: 500,
})

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'anonymous'

    try {
      await limiter.check(5, ip) // 5 tentativas por minuto
    } catch {
      return NextResponse.json(
        {
          error: 'Muitas tentativas de login. Tente novamente em alguns instantes.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        { status: 429 }
      )
    }

    // Validação
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // TODO: Implementar verificação de credenciais
    // Por enquanto, apenas validação
    // Em produção, você deve:
    // 1. Buscar usuário no banco de dados
    // 2. Verificar senha com bcrypt
    // 3. Gerar JWT token
    // 4. Retornar token seguro

    // Simulação de autenticação (remover em produção)
    if (
      validatedData.email === 'admin@admin.com' &&
      validatedData.password === 'admin1234'
    ) {
      return NextResponse.json(
        {
          success: true,
          message: 'Login realizado com sucesso',
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        error: 'Email ou senha incorretos',
        code: 'INVALID_CREDENTIALS',
      },
      { status: 401 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          code: 'VALIDATION_ERROR',
          issues: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      )
    }

    console.error('Erro ao processar login:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }
}
