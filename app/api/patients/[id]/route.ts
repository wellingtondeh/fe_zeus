import { NextResponse } from 'next/server'
import { z } from 'zod'
import { patientSchema } from '@/lib/validations/patient'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Preparar dados (remover máscaras)
    const dataToUpdate = {
      ...body,
      cpf: body.cpf ? body.cpf.replace(/\D/g, '') : '',
      endereco: {
        ...body.endereco,
        cep: body.endereco.cep ? body.endereco.cep.replace(/\D/g, '') : '',
      },
    }

    const validatedData = patientSchema.parse(dataToUpdate)

    // TODO: Implementar atualização de paciente no banco de dados
    // Por enquanto, apenas validação
    // Em produção, você deve:
    // 1. Verificar se o paciente existe
    // 2. Atualizar paciente no banco de dados
    // 3. Retornar dados do paciente atualizado

    // Simulação de sucesso
    return NextResponse.json(
      {
        success: true,
        message: 'Paciente atualizado com sucesso',
        data: {
          id,
          ...validatedData,
        },
      },
      { status: 200 }
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

    console.error('Erro ao atualizar paciente:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // TODO: Implementar exclusão de paciente no banco de dados
    // Por enquanto, apenas simulação
    // Em produção, você deve:
    // 1. Verificar se o paciente existe
    // 2. Verificar se há prontuários associados (opcional: impedir exclusão se houver)
    // 3. Excluir paciente do banco de dados
    // 4. Retornar confirmação

    // Simulação de sucesso
    return NextResponse.json(
      {
        success: true,
        message: 'Paciente excluído com sucesso',
        id,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao excluir paciente:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }
}
