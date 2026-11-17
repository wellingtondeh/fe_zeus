import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { type Area } from '@/types/dashboard'
import { cn } from '@/lib/utils'

interface AreaCardProps {
  area: Area
  className?: string
}

export function AreaCard({ area, className }: AreaCardProps) {
  return (
    <Link href={`/dashboard/${area.id}`}>
      <Card
        className={cn(
          'p-4 sm:p-6 transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer',
          className
        )}
      >
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div
            className={cn(
              'p-2 sm:p-3 rounded-lg',
              area.bgColor
            )}
          >
            <span className="text-xl sm:text-2xl" role="img" aria-label={area.name}>
              {area.icon}
            </span>
          </div>
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
          {area.name}
        </h3>
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex justify-between text-sm sm:text-sm">
            <span className="text-gray-600">Agendamentos hoje</span>
            <span className="font-medium text-gray-900">
              {area.agendamentosHoje}
            </span>
          </div>
          <div className="flex justify-between text-sm sm:text-sm">
            <span className="text-gray-600">Total do mês</span>
            <span className="font-medium text-gray-900">
              {area.totalAgendamentos}
            </span>
          </div>
          <div className="flex justify-between text-sm sm:text-sm">
            <span className="text-gray-600">Pacientes ativos</span>
            <span className="font-medium text-gray-900">
              {area.pacientesAtivos}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
