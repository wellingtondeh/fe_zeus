import type { Metadata } from 'next'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { PatientForm } from '@/components/features/patient/patient-form'
import { BreadcrumbWrapper } from '@/components/ui/breadcrumb-wrapper'

export const metadata: Metadata = {
  title: 'Cadastrar Paciente | Dashboard',
  description: 'Cadastre um novo paciente no sistema',
}

export default function NewPatientPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <BreadcrumbWrapper />

          {/* Formulário */}
          <PatientForm />
        </div>
      </main>
    </div>
  )
}
