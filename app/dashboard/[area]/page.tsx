import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { MetricCard } from '@/components/dashboard/metric-card'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BreadcrumbWrapper } from '@/components/ui/breadcrumb-wrapper'
import { type AreaType } from '@/types/dashboard'

const areaData: Record<
  AreaType,
  {
    name: string
    icon: string
    bgColor: string
    description: string
  }
> = {
  pilates: {
    name: 'Pilates',
    icon: '🧘',
    bgColor: 'bg-purple-100',
    description:
      'Gestão de aulas e agendamentos de Pilates. Acompanhe instrutores, alunos e horários.',
  },
  medico: {
    name: 'Consultório Médico',
    icon: '🩺',
    bgColor: 'bg-blue-100',
    description:
      'Gestão completa do consultório médico. Agendamentos, prontuários e consultas.',
  },
  fisioterapia: {
    name: 'Fisioterapia',
    icon: '💪',
    bgColor: 'bg-green-100',
    description:
      'Controle de sessões de fisioterapia, tratamentos e evolução dos pacientes.',
  },
  nutricao: {
    name: 'Nutrição',
    icon: '🥗',
    bgColor: 'bg-orange-100',
    description:
      'Gestão de consultas nutricionais, planos alimentares e acompanhamento.',
  },
  odontologia: {
    name: 'Odontologia',
    icon: '🦷',
    bgColor: 'bg-teal-100',
    description:
      'Controle de consultas odontológicas, tratamentos e procedimentos realizados.',
  },
}

interface AreaPageProps {
  params: Promise<{ area: string }>
}

export async function generateMetadata({
  params,
}: AreaPageProps): Promise<Metadata> {
  const { area } = await params
  const data = areaData[area as AreaType]

  if (!data) {
    return {
      title: 'Área não encontrada',
    }
  }

  return {
    title: `${data.name} | Dashboard`,
    description: data.description,
  }
}

export default async function AreaPage({ params }: AreaPageProps) {
  const { area } = await params
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

          {/* Header da Área */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className={`p-2 sm:p-4 rounded-lg ${data.bgColor} flex-shrink-0`}>
                <span className="text-2xl sm:text-4xl" role="img" aria-label={data.name}>
                  {data.icon}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {data.name}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">{data.description}</p>
              </div>
            </div>
          </div>

          {/* Métricas da Área */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <MetricCard
              label="Agendamentos Hoje"
              value={12}
              change={5}
              trend="up"
            />
            <MetricCard
              label="Total do Mês"
              value={156}
              change={8}
              trend="up"
            />
            <MetricCard
              label="Pacientes Ativos"
              value={52}
              change={3}
              trend="up"
            />
            <MetricCard
              label="Taxa de Comparecimento"
              value="92%"
              change={-2}
              trend="down"
            />
          </div>

          {/* Conteúdo Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="lg:col-span-2 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                Próximos Agendamentos
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        Paciente {i}
                      </p>
                      <p className="text-sm sm:text-sm text-gray-600">
                        {9 + i * 30 < 60
                          ? `0${9 + Math.floor((i * 30) / 60)}:${(i * 30) % 60 === 0 ? '00' : (i * 30) % 60}`
                          : `${9 + Math.floor((i * 30) / 60)}:${(i * 30) % 60 === 0 ? '00' : (i * 30) % 60}`}
                      </p>
                    </div>
                    <span className="px-2 sm:px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 whitespace-nowrap flex-shrink-0">
                      Confirmado
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Ações Rápidas
              </h2>
              <div className="space-y-3">
                <Link href={`/dashboard/${area}/appointments/new?from=${area}`}>
                  <Button variant="primary" className="w-full justify-start flex items-center gap-2">
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Novo Agendamento
                  </Button>
                </Link>
                <Link
                  href={`/dashboard/patients?from=${area}`}
                  className="block w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start flex items-center gap-2"
                    type="button"
                  >
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
                        d="M17 20h5v-2a3 3 0 00-3-3h-4a3 3 0 00-3 3v2zM9 10a3 3 0 100-6 3 3 0 000 6zM9 20h5v-2a3 3 0 00-3-3H6a3 3 0 00-3 3v2z"
                      />
                    </svg>
                    Paciente
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start flex items-center gap-2">
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Ver Relatórios
                </Button>
                <Button variant="outline" className="w-full justify-start flex items-center gap-2">
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Configurações
                </Button>
              </div>
            </Card>
          </div>

          {/* Botão Voltar */}
          <div className="mt-6 sm:mt-8">
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center justify-center gap-2 w-full sm:w-auto">
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span className="hidden sm:inline">Voltar para Dashboard</span>
                <span className="sm:hidden">Voltar</span>
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
