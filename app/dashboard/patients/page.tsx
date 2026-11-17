'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { PatientTable } from '@/components/patients/patient-table'
import { BreadcrumbWrapper } from '@/components/ui/breadcrumb-wrapper'
import { type Patient } from '@/types/patient'

// Dados mockados - em produção, viriam de uma API ou banco de dados
const initialPatients: Patient[] = [
  {
    id: '1',
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
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
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
    createdAt: '2024-01-16T14:30:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
  },
  {
    id: '3',
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
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T09:15:00Z',
  },
  {
    id: '4',
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
    createdAt: '2024-01-18T11:20:00Z',
    updatedAt: '2024-01-18T11:20:00Z',
  },
  {
    id: '5',
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
    createdAt: '2024-01-19T16:45:00Z',
    updatedAt: '2024-01-19T16:45:00Z',
  },
]

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(initialPatients)

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
          {/* Breadcrumb */}
          <BreadcrumbWrapper />

          {/* Header */}
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
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Pacientes</h1>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Gerencie todos os pacientes cadastrados no sistema
            </p>
          </div>

          {/* Tabela de Pacientes */}
          <PatientTable patients={patients} onPatientDeleted={handlePatientDeleted} />
        </div>
      </main>
    </div>
  )
}
