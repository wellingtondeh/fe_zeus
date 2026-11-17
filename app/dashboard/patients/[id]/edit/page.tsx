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

export const metadata: Metadata = {
  title: 'Editar Paciente | Dashboard',
  description: 'Edite os dados do paciente',
}

// Dados mockados - em produção, viriam de uma API ou banco de dados
const mockPatients: Record<string, PatientInput> = {
  '1': {
    nome: 'Maria Silva',
    email: 'maria.silva@email.com',
    telefone: '11987654321',
    cpf: '12345678901',
    dataNascimento: '1985-05-15',
    sexo: 'F',
    endereco: {
      cep: '01310-100',
      rua: 'Avenida Paulista',
      numero: '1000',
      complemento: 'Apto 101',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
    },
    observacoes: '',
  },
  '2': {
    nome: 'João Santos',
    email: 'joao.santos@email.com',
    telefone: '11976543210',
    cpf: '98765432100',
    dataNascimento: '1990-08-20',
    sexo: 'M',
    endereco: {
      cep: '02013-000',
      rua: 'Rua das Flores',
      numero: '250',
      bairro: 'Santana',
      cidade: 'São Paulo',
      estado: 'SP',
    },
    observacoes: '',
  },
  '3': {
    nome: 'Ana Costa',
    email: 'ana.costa@email.com',
    telefone: '11965432109',
    cpf: '11122233344',
    dataNascimento: '1992-12-10',
    sexo: 'F',
    endereco: {
      cep: '04038-001',
      rua: 'Avenida Brigadeiro Faria Lima',
      numero: '1500',
      complemento: 'Sala 205',
      bairro: 'Jardim Paulistano',
      cidade: 'São Paulo',
      estado: 'SP',
    },
    observacoes: '',
  },
  '4': {
    nome: 'Pedro Oliveira',
    telefone: '11954321098',
    dataNascimento: '1988-03-25',
    sexo: 'M',
    endereco: {
      cep: '01310-100',
      rua: 'Rua Augusta',
      numero: '500',
      bairro: 'Consolação',
      cidade: 'São Paulo',
      estado: 'SP',
    },
    observacoes: '',
  },
  '5': {
    nome: 'Carla Mendes',
    email: 'carla.mendes@email.com',
    telefone: '11943210987',
    cpf: '55566677788',
    dataNascimento: '1995-07-08',
    sexo: 'F',
    endereco: {
      cep: '05015-000',
      rua: 'Rua dos Três Irmãos',
      numero: '100',
      bairro: 'Vila Progredior',
      cidade: 'São Paulo',
      estado: 'SP',
    },
    observacoes: '',
  },
}

interface EditPatientPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPatientPage({ params }: EditPatientPageProps) {
  const { id } = await params
  const patientData = mockPatients[id]

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

  // Preparar dados com máscaras aplicadas
  const initialData: PatientInput = {
    ...patientData,
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
          {/* Breadcrumb */}
          <BreadcrumbWrapper />

          {/* Botão Prontuários */}
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

          {/* Formulário */}
          <PatientForm initialData={initialData} patientId={id} />
        </div>
      </main>
    </div>
  )
}
