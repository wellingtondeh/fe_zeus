import { patientSchema, type PatientInput } from '@/lib/validations/patient'
import {
  getPatients,
  newId,
  savePatients,
} from './store'
import type { MockApiResult, MockPatient } from './types'

function delay(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function listPatients(): Promise<MockApiResult<MockPatient[]>> {
  await delay(100)
  return { ok: true, data: getPatients() }
}

export async function getPatient(
  id: string
): Promise<MockApiResult<MockPatient>> {
  await delay(100)
  const patient = getPatients().find((p) => p.id === id)
  if (!patient) {
    return {
      ok: false,
      status: 404,
      error: 'Paciente não encontrado',
      code: 'NOT_FOUND',
    }
  }
  return { ok: true, data: patient }
}

export async function createPatient(
  input: PatientInput
): Promise<MockApiResult<MockPatient>> {
  await delay()
  const parsed = patientSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      error: 'Dados inválidos',
      code: 'VALIDATION_ERROR',
      issues: parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    }
  }

  const patient: MockPatient = { id: newId(), ...parsed.data }
  const patients = getPatients()
  patients.push(patient)
  savePatients(patients)

  return {
    ok: true,
    data: patient,
    message: 'Paciente cadastrado com sucesso',
  }
}

export async function updatePatient(
  id: string,
  input: PatientInput
): Promise<MockApiResult<MockPatient>> {
  await delay()
  const parsed = patientSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      error: 'Dados inválidos',
      code: 'VALIDATION_ERROR',
      issues: parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    }
  }

  const patients = getPatients()
  const index = patients.findIndex((p) => p.id === id)
  if (index < 0) {
    return {
      ok: false,
      status: 404,
      error: 'Paciente não encontrado',
      code: 'NOT_FOUND',
    }
  }

  const updated: MockPatient = { id, ...parsed.data }
  patients[index] = updated
  savePatients(patients)

  return {
    ok: true,
    data: updated,
    message: 'Paciente atualizado com sucesso',
  }
}

export async function deletePatient(
  id: string
): Promise<MockApiResult<{ id: string }>> {
  await delay()
  const patients = getPatients()
  const next = patients.filter((p) => p.id !== id)
  if (next.length === patients.length) {
    return {
      ok: false,
      status: 404,
      error: 'Paciente não encontrado',
      code: 'NOT_FOUND',
    }
  }
  savePatients(next)
  return { ok: true, data: { id }, message: 'Paciente excluído com sucesso' }
}
