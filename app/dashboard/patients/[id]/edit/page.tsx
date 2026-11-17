import type { Metadata } from 'next'
import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { PatientForm } from '@/components/features/patient/patient-form'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BreadcrumbWrapper } from '@/components/ui/breadcrumb-wrapper'
import { type PatientInput } from '@/lib/validations/patient'
import { applyCepMask } from '@/lib/utils/cep'
import { applyCpfMask } from '@/lib/utils/cpf'
import { applyPhoneMask } from '@/lib/utils/phone'
import {
  getSeedPatientById,
  STATIC_PATIENT_IDS,
} from '@/lib/mock'

export const metadata: Metadata = {
  title: 'Editar Paciente | Dashboard',
  description: 'Edite os dados do paciente',
}

export function generateStaticParams() {
  return STATIC_PATIENT_IDS.map((id) => ({ id }))
}

interface EditPatientPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPatientPage({ params }: EditPatientPageProps) {
  const { id } = await params
  const patientData = getSeedPatientById(id)

  if (!patientData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <Card.Content className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Paciente não encontrado
                </h2>
                <p className="text-gray-600 mb-4">
                  O paciente solicitado não foi encontrado.
                </p>
                <Link href="/dashboard/patients">
                  <Button variant="outline">Voltar para Lista</Button>
                </Link>
              </Card.Content>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  const { id: _patientId, ...patientFields } = patientData
  const initialData: PatientInput = {
    ...patientFields,
    telefone: applyPhoneMask(patientData.telefone),
    cpf: patientData.cpf ? applyCpfMask(patientData.cpf) : '',
    endereco: {
      ...patientData.endereco,
      cep: patientData.endereco.cep
        ? applyCepMask(patientData.endereco.cep)
        : '',
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto lg:max-w-none lg:w-full">
          <BreadcrumbWrapper />

          <div className="mb-6 flex justify-end">
            <Link href={`/dashboard/records?patientId=${id}`}>
              <Button variant="outline" className="flex items-center gap-2">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Prontuários
              </Button>
            </Link>
          </div>

          <PatientForm initialData={initialData} patientId={id} />
        </div>
      </main>
    </div>
  )
}
