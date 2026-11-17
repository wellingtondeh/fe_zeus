import { NextResponse } from 'next/server'
import { z } from 'zod'
import { isAllowedRecordAttachment } from '@/lib/utils/record-file-accept'

const recordSchema = z.object({
  patientId: z.string().min(1, 'Paciente é obrigatório'),
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
})

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || ''

    let validatedData: z.infer<typeof recordSchema>
    let attachmentCount = 0

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const patientId = String(formData.get('patientId') ?? '')
      const title = String(formData.get('title') ?? '')
      const content = String(formData.get('content') ?? '')
      const rawFiles = formData.getAll('attachments')
      const files = rawFiles.filter((v): v is File => v instanceof File)
      for (const f of files) {
        if (!isAllowedRecordAttachment(f)) {
          return NextResponse.json(
            {
              error: `Tipo de arquivo não permitido: ${f.name}`,
              code: 'INVALID_ATTACHMENT',
            },
            { status: 400 }
          )
        }
      }
      attachmentCount = files.length
      validatedData = recordSchema.parse({ patientId, title, content })
    } else {
      const body = await request.json()
      validatedData = recordSchema.parse(body)
    }

    // TODO: Implementar criação de prontuário no banco de dados
    // Por enquanto, apenas validação
    // Em produção, você deve:
    // 1. Verificar se o paciente existe
    // 2. Criar prontuário no banco de dados
    // 3. Persistir anexos (multipart) em armazenamento seguro
    // 4. Retornar dados do prontuário criado

    // Simulação de sucesso
    return NextResponse.json(
      {
        success: true,
        message: 'Prontuário criado com sucesso',
        data: {
          id: Math.random().toString(36).substring(7),
          ...validatedData,
          attachmentCount,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'Dr. Sistema',
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

    console.error('Erro ao criar prontuário:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }
}
