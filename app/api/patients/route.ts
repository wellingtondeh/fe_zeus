import { NextResponse } from 'next/server'
import { z } from 'zod'
import { patientSchema } from '@/lib/validations/patient'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = patientSchema.parse(body)

    // TODO: Implementar criação de paciente no banco de dados
    // Por enquanto, apenas validação
    // Em produção, você deve:
    // 1. Verificar se CPF já existe (se fornecido)
    // 2. Criar paciente no banco de dados
    // 3. Retornar dados do paciente criado

    // Simulação de sucesso
    return NextResponse.json(
      {
        success: true,
        message: 'Paciente cadastrado com sucesso',
        data: {
          id: Math.random().toString(36).substring(7),
          ...validatedData,
        },
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

    console.error('Erro ao cadastrar paciente:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }
}
