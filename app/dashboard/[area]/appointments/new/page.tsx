import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { BreadcrumbWrapper } from '@/components/ui/breadcrumb-wrapper'
import { AppointmentForm } from '@/components/features/appointments/appointment-form'
import { type AreaType } from '@/types/dashboard'

const areaData: Record<
  AreaType,
  {
    name: string
    icon: string
    bgColor: string
  }
> = {
  pilates: {
    name: 'Pilates',
    icon: '🧘',
    bgColor: 'bg-purple-100',
  },
  medico: {
    name: 'Consultório Médico',
    icon: '🩺',
    bgColor: 'bg-blue-100',
  },
  fisioterapia: {
    name: 'Fisioterapia',
    icon: '💪',
    bgColor: 'bg-green-100',
  },
  nutricao: {
    name: 'Nutrição',
    icon: '🥗',
    bgColor: 'bg-orange-100',
  },
  odontologia: {
    name: 'Odontologia',
    icon: '🦷',
    bgColor: 'bg-teal-100',
  },
}

interface NewAppointmentPageProps {
  params: Promise<{ area: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({
  params,
}: NewAppointmentPageProps): Promise<Metadata> {
  const { area } = await params
  const data = areaData[area as AreaType]

  if (!data) {
    return {
      title: 'Área não encontrada',
    }
  }

  return {
    title: `Novo Agendamento - ${data.name} | Dashboard`,
    description: `Criar novo agendamento para ${data.name}`,
  }
}

export default async function NewAppointmentPage({
  params,
  searchParams,
}: NewAppointmentPageProps) {
  const { area } = await params
  const searchParamsData = await searchParams
  const data = areaData[area as AreaType]

  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <BreadcrumbWrapper />

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-4 rounded-lg ${data.bgColor}`}>
                <span className="text-4xl" role="img" aria-label={data.name}>
                  {data.icon}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Novo Agendamento
                </h1>
                <p className="text-gray-600 mt-1">
                  {data.name} - Selecione data, horário e profissional
                </p>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <Suspense fallback={<div className="text-center py-8">Carregando...</div>}>
            <AppointmentForm area={area as AreaType} searchParams={searchParamsData} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
