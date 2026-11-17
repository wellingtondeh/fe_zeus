import { NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'
import { registerSchema } from '@/lib/validations/auth'

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
      await limiter.check(3, ip) // 3 tentativas por minuto
    } catch {
      return NextResponse.json(
        {
          error: 'Muitas tentativas de cadastro. Tente novamente em alguns instantes.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        { status: 429 }
      )
    }

    // Validação
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Validar formato do documento
    const documentNumbers = validatedData.document.replace(/\D/g, '')
    const isCpf = documentNumbers.length === 11
    const isCnpj = documentNumbers.length === 14

    if (!isCpf && !isCnpj) {
      return NextResponse.json(
        {
          error: 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos',
          code: 'INVALID_DOCUMENT',
        },
        { status: 400 }
      )
    }

    // TODO: Implementar criação de usuário no banco de dados
    // Por enquanto, apenas validação
    // Em produção, você deve:
    // 1. Verificar se email já existe
    // 2. Verificar se CPF/CNPJ já existe
    // 3. Hash da senha com bcrypt
    // 4. Criar usuário no banco de dados
    // 5. Retornar sucesso ou erro apropriado

    // Simulação de cadastro (remover em produção)
    return NextResponse.json(
      {
        success: true,
        message: 'Cadastro realizado com sucesso',
      },
      { status: 201 }
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

    console.error('Erro ao processar cadastro:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }
}
