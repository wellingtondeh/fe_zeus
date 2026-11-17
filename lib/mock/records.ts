import { z } from 'zod'
import { isAllowedRecordAttachment } from '@/lib/utils/record-file-accept'
import {
  getPatients,
  getRecords,
  newId,
  saveRecords,
} from './store'
import type { MockApiResult, MockRecord } from './types'

const recordSchema = z.object({
  patientId: z.string().min(1, 'Paciente é obrigatório'),
  title: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
})

function delay(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function patientName(patientId: string): string {
  return getPatients().find((p) => p.id === patientId)?.nome ?? 'Paciente'
}

export async function listRecords(): Promise<MockApiResult<MockRecord[]>> {
  await delay(100)
  return { ok: true, data: getRecords() }
}

export async function getRecord(
  id: string
): Promise<MockApiResult<MockRecord>> {
  await delay(100)
  const record = getRecords().find((r) => r.id === id)
  if (!record) {
    return {
      ok: false,
      status: 404,
      error: 'Prontuário não encontrado',
      code: 'NOT_FOUND',
    }
  }
  return { ok: true, data: record }
}

export async function createRecord(input: {
  patientId: string
  title: string
  content: string
  attachments?: File[]
}): Promise<MockApiResult<MockRecord>> {
  await delay()

  if (input.attachments?.length) {
    for (const file of input.attachments) {
      if (!isAllowedRecordAttachment(file)) {
        return {
          ok: false,
          status: 400,
          error: `Tipo de arquivo não permitido: ${file.name}`,
          code: 'INVALID_ATTACHMENT',
        }
      }
    }
  }

  const parsed = recordSchema.safeParse(input)
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

  const now = new Date().toISOString()
  const record: MockRecord = {
    id: newId(),
    patientId: parsed.data.patientId,
    patientName: patientName(parsed.data.patientId),
    title: parsed.data.title,
    content: parsed.data.content,
    createdAt: now,
    updatedAt: now,
    createdBy: 'Dr. Sistema',
  }

  const records = getRecords()
  records.unshift(record)
  saveRecords(records)

  return {
    ok: true,
    data: record,
    message: 'Prontuário criado com sucesso',
  }
}

export async function updateRecord(
  id: string,
  input: {
    patientId: string
    title: string
    content: string
    attachments?: File[]
  }
): Promise<MockApiResult<MockRecord>> {
  await delay()

  if (input.attachments?.length) {
    for (const file of input.attachments) {
      if (!isAllowedRecordAttachment(file)) {
        return {
          ok: false,
          status: 400,
          error: `Tipo de arquivo não permitido: ${file.name}`,
          code: 'INVALID_ATTACHMENT',
        }
      }
    }
  }

  const parsed = recordSchema.safeParse(input)
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

  const records = getRecords()
  const index = records.findIndex((r) => r.id === id)
  if (index < 0) {
    return {
      ok: false,
      status: 404,
      error: 'Prontuário não encontrado',
      code: 'NOT_FOUND',
    }
  }

  const current = records[index]!
  const updated: MockRecord = {
    ...current,
    patientId: parsed.data.patientId,
    patientName: patientName(parsed.data.patientId),
    title: parsed.data.title,
    content: parsed.data.content,
    updatedAt: new Date().toISOString(),
  }
  records[index] = updated
  saveRecords(records)

  return {
    ok: true,
    data: updated,
    message: 'Prontuário atualizado com sucesso',
  }
}

export async function deleteRecord(
  id: string
): Promise<MockApiResult<{ id: string }>> {
  await delay()
  const records = getRecords()
  const next = records.filter((r) => r.id !== id)
  if (next.length === records.length) {
    return {
      ok: false,
      status: 404,
      error: 'Prontuário não encontrado',
      code: 'NOT_FOUND',
    }
  }
  saveRecords(next)
  return { ok: true, data: { id }, message: 'Prontuário excluído com sucesso' }
}
