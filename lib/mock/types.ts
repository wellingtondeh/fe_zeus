import type { PatientInput } from '@/lib/validations/patient'
import type { MedicalRecord } from '@/types/record'

export type MockUser = {
  email: string
  password: string
  name: string
}

export type MockPatient = PatientInput & { id: string }

export type MockRecord = MedicalRecord

export type MockApiIssue = {
  field: string
  message: string
}

export type MockApiSuccess<T> = {
  ok: true
  data: T
  message?: string
}

export type MockApiFailure = {
  ok: false
  error: string
  code?: string
  status: number
  issues?: MockApiIssue[]
}

export type MockApiResult<T> = MockApiSuccess<T> | MockApiFailure
