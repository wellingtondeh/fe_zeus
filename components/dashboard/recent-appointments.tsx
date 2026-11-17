import { Card } from '@/components/ui/card'
import { type Agendamento } from '@/types/dashboard'
import { cn } from '@/lib/utils'

interface RecentAppointmentsProps {
  appointments: Agendamento[]
  className?: string
}

const areaNames: Record<string, string> = {
  pilates: 'Pilates',
  medico: 'Médico',
  fisioterapia: 'Fisioterapia',
  nutricao: 'Nutrição',
  odontologia: 'Odontologia',
}

const statusColors = {
  confirmado: 'bg-green-100 text-green-800',
  pendente: 'bg-yellow-100 text-yellow-800',
  cancelado: 'bg-red-100 text-red-800',
}

export function RecentAppointments({
  appointments,
  className,
}: RecentAppointmentsProps) {
  return (
    <Card className={cn('p-4 sm:p-6', className)}>
      <div className="mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Próximos Agendamentos
        </h3>
        <p className="text-sm sm:text-sm text-gray-600">
          Últimos {appointments.length} agendamentos
        </p>
      </div>
      <div className="space-y-2 sm:space-y-3">
        {appointments.length === 0 ? (
          <p className="text-sm sm:text-sm text-gray-500 text-center py-4">
            Nenhum agendamento encontrado
          </p>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                  {appointment.paciente}
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
                  <span className="text-sm sm:text-sm text-gray-600">
                    {areaNames[appointment.area] || appointment.area}
                  </span>
                  <span className="text-gray-400 hidden sm:inline">•</span>
                  <span className="text-sm sm:text-sm text-gray-600">
                    {appointment.horario}
                  </span>
                </div>
              </div>
              <span
                className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0',
                  statusColors[appointment.status]
                )}
              >
                {appointment.status === 'confirmado'
                  ? 'Confirmado'
                  : appointment.status === 'pendente'
                    ? 'Pendente'
                    : 'Cancelado'}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
