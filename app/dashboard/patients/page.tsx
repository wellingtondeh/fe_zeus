'use client'

import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { PatientTable } from '@/components/patients/patient-table'
import { BreadcrumbWrapper } from '@/components/ui/breadcrumb-wrapper'
import { type Patient } from '@/types/patient'
import { getPatients } from '@/lib/mock'

function toPatientList(): Patient[] {
  const now = new Date().toISOString()
  return getPatients().map((p) => ({
    ...p,
    createdAt: now,
    updatedAt: now,
  }))
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])

  useEffect(() => {
    setPatients(toPatientList())
  }, [])

  const handlePatientDeleted = (patientId: string) => {
    setPatients((prevPatients) =>
      prevPatients.filter((patient) => patient.id !== patientId)
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <BreadcrumbWrapper />

          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <svg
                className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-3-3h-4a3 3 0 00-3 3v2zM9 10a3 3 0 100-6 3 3 0 000 6zM9 20h5v-2a3 3 0 00-3-3H6a3 3 0 00-3 3v2z"
                />
              </svg>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Pacientes
              </h1>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Gerencie todos os pacientes cadastrados no sistema
            </p>
          </div>

          <PatientTable patients={patients} onPatientDeleted={handlePatientDeleted} />
        </div>
      </main>
    </div>
  )
}
