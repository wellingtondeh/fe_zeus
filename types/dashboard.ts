export type AreaType =
  | 'pilates'
  | 'medico'
  | 'fisioterapia'
  | 'nutricao'
  | 'odontologia'

export interface Area {
  id: AreaType
  name: string
  icon: string
  color: string
  bgColor: string
  totalAgendamentos: number
  agendamentosHoje: number
  pacientesAtivos: number
}

export interface Metric {
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
}

export interface Agendamento {
  id: string
  paciente: string
  area: AreaType
  horario: string
  status: 'confirmado' | 'pendente' | 'cancelado'
}
