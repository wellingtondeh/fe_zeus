import patientsSeed from '@/data/patients.json'
import recordsSeed from '@/data/records.json'
import usersSeed from '@/data/users.json'
import type { MockPatient, MockRecord, MockUser } from './types'

const PATIENTS_KEY = 'mock:patients'
const RECORDS_KEY = 'mock:records'
const USERS_KEY = 'mock:users'
const AUTH_KEY = 'mock:auth'

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!canUseStorage()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function getUsers(): MockUser[] {
  return readJson<MockUser[]>(USERS_KEY, usersSeed as MockUser[])
}

export function saveUsers(users: MockUser[]): void {
  writeJson(USERS_KEY, users)
}

export function getPatients(): MockPatient[] {
  return readJson<MockPatient[]>(PATIENTS_KEY, patientsSeed as MockPatient[])
}

export function savePatients(patients: MockPatient[]): void {
  writeJson(PATIENTS_KEY, patients)
}

export function getRecords(): MockRecord[] {
  return readJson<MockRecord[]>(RECORDS_KEY, recordsSeed as MockRecord[])
}

export function saveRecords(records: MockRecord[]): void {
  writeJson(RECORDS_KEY, records)
}

export function setAuthSession(session: { email: string; name: string } | null): void {
  if (!canUseStorage()) return
  if (!session) {
    window.localStorage.removeItem(AUTH_KEY)
    return
  }
  writeJson(AUTH_KEY, session)
}

export function getAuthSession(): { email: string; name: string } | null {
  return readJson<{ email: string; name: string } | null>(AUTH_KEY, null)
}

export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

/** IDs estáticos usados no export (generateStaticParams). */
export const STATIC_PATIENT_IDS = (patientsSeed as MockPatient[]).map((p) => p.id)
export const STATIC_RECORD_IDS = (recordsSeed as MockRecord[]).map((r) => r.id)

export function getSeedPatientById(id: string): MockPatient | undefined {
  return (patientsSeed as MockPatient[]).find((p) => p.id === id)
}

export function getSeedRecordById(id: string): MockRecord | undefined {
  return (recordsSeed as MockRecord[]).find((r) => r.id === id)
}
