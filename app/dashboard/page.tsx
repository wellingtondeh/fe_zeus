import type { Metadata } from 'next'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { MetricCard } from '@/components/dashboard/metric-card'
import { AreaCard } from '@/components/dashboard/area-card'
import { RecentAppointments } from '@/components/dashboard/recent-appointments'
import { type Area, type Agendamento } from '@/types/dashboard'

export const metadata: Metadata = {
  title: 'Dashboard | Gestão Multidisciplinar',
  description: 'Painel de controle do sistema de gestão de consultórios multidisciplinares',
}

// Dados mockados - em produção, viriam de uma API ou banco de dados
const areas: Area[] = [
  {
    id: 'pilates',
    name: 'Pilates',
    icon: '🧘',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    totalAgendamentos: 142,
    agendamentosHoje: 8,
    pacientesAtivos: 45,
  },
  {
    id: 'medico',
    name: 'Consultório Médico',
    icon: '🩺',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    totalAgendamentos: 89,
    agendamentosHoje: 12,
    pacientesAtivos: 67,
  },
  {
    id: 'fisioterapia',
    name: 'Fisioterapia',
    icon: '💪',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    totalAgendamentos: 156,
    agendamentosHoje: 15,
    pacientesAtivos: 52,
  },
  {
    id: 'nutricao',
    name: 'Nutrição',
    icon: '🥗',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    totalAgendamentos: 98,
    agendamentosHoje: 6,
    pacientesAtivos: 38,
  },
  {
    id: 'odontologia',
    name: 'Odontologia',
    icon: '🦷',
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    totalAgendamentos: 124,
    agendamentosHoje: 10,
    pacientesAtivos: 41,
  },
]

const recentAppointments: Agendamento[] = [
  {
    id: '1',
    paciente: 'Maria Silva',
    area: 'fisioterapia',
    horario: '09:00',
    status: 'confirmado',
  },
  {
    id: '2',
    paciente: 'João Santos',
    area: 'medico',
    horario: '10:30',
    status: 'confirmado',
  },
  {
    id: '3',
    paciente: 'Ana Costa',
    area: 'pilates',
    horario: '11:00',
    status: 'pendente',
  },
  {
    id: '4',
    paciente: 'Pedro Oliveira',
    area: 'odontologia',
    horario: '14:00',
    status: 'confirmado',
  },
  {
    id: '5',
    paciente: 'Carla Mendes',
    area: 'nutricao',
    horario: '15:30',
    status: 'confirmado',
  },
]

export default function DashboardPage() {
  const totalAgendamentosHoje = areas.reduce(
    (sum, area) => sum + area.agendamentosHoje,
    0
  )
  const totalPacientesAtivos = areas.reduce(
    (sum, area) => sum + area.pacientesAtivos,
    0
  )
  const totalAgendamentosMes = areas.reduce(
    (sum, area) => sum + area.totalAgendamentos,
    0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userName="Admin" />

      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Cabeçalho */}
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Visão Geral
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Resumo das atividades de todas as áreas
            </p>
          </div>

          {/* Áreas */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Áreas de Atendimento
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {areas.map((area) => (
                <AreaCard key={area.id} area={area} />
              ))}
            </div>
          </div>

          {/* Métricas Gerais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <MetricCard
              label="Agendamentos Hoje"
              value={totalAgendamentosHoje}
              change={12}
              trend="up"
              icon={
                <svg
                  className="h-8 w-8 text-blue-500"
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
              }
            />
            <MetricCard
              label="Total do Mês"
              value={totalAgendamentosMes}
              change={8}
              trend="up"
              icon={
                <svg
                  className="h-8 w-8 text-green-500"
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
              }
            />
            <MetricCard
              label="Pacientes Ativos"
              value={totalPacientesAtivos}
              change={5}
              trend="up"
              icon={
                <svg
                  className="h-8 w-8 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
            />
            <MetricCard
              label="Taxa de Ocupação"
              value="78%"
              change={-2}
              trend="down"
              icon={
                <svg
                  className="h-8 w-8 text-orange-500"
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
              }
            />
          </div>

          {/* Próximos Agendamentos e Resumo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <RecentAppointments appointments={recentAppointments} />
            
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Resumo por Área
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {areas.map((area) => (
                  <div key={area.id} className="flex items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className={`p-1.5 sm:p-2 rounded-lg ${area.bgColor} flex-shrink-0`}>
                        <span className="text-lg sm:text-xl" role="img" aria-label={area.name}>
                          {area.icon}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{area.name}</p>
                        <p className="text-sm sm:text-sm text-gray-600">
                          {area.agendamentosHoje} hoje
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">
                        {area.totalAgendamentos}
                      </p>
                      <p className="text-xs text-gray-500">este mês</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
