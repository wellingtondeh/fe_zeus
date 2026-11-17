'use client'

import React, { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'
import { type AreaType } from '@/types/dashboard'

const areaData: Record<
  AreaType,
  {
    name: string
    icon: string
  }
> = {
  pilates: {
    name: 'Pilates',
    icon: '🧘',
  },
  medico: {
    name: 'Consultório Médico',
    icon: '🩺',
  },
  fisioterapia: {
    name: 'Fisioterapia',
    icon: '💪',
  },
  nutricao: {
    name: 'Nutrição',
    icon: '🥗',
  },
  odontologia: {
    name: 'Odontologia',
    icon: '🦷',
  },
}

const iconMap: Record<string, React.ReactNode> = {
  dashboard: (
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
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  ),
  patients: (
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
  ),
  records: (
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
  ),
  edit: (
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
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  ),
  new: (
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
        d="M12 4v16m8-8H4"
      />
    </svg>
  ),
  view: (
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
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ),
}

export function useBreadcrumbSetup() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { setBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    const breadcrumbs: Array<{ label: string; href: string; icon?: React.ReactNode }> = []

    // Sempre adiciona Dashboard como primeiro item
    breadcrumbs.push({
      label: 'Dashboard',
      href: '/dashboard',
      icon: iconMap.dashboard,
    })

    // Analisa a rota atual
    const pathSegments = pathname.split('/').filter(Boolean)
    const fromArea = searchParams.get('from') as AreaType | null

    if (pathSegments[0] === 'dashboard') {
      // Dashboard principal
      if (pathSegments.length === 1) {
        // Já adicionado acima
      }
      // Área específica (pilates, medico, etc)
      else if (pathSegments.length === 2 && pathSegments[1] && !['patients', 'records'].includes(pathSegments[1])) {
        const area = pathSegments[1] as AreaType
        if (areaData[area]) {
          breadcrumbs.push({
            label: areaData[area].name,
            href: `/dashboard/${area}`,
            icon: <span className="text-lg" role="img" aria-label={areaData[area].name}>{areaData[area].icon}</span>,
          })
        }
      }
      // Agendamentos dentro de uma área
      else if (pathSegments.length >= 3 && pathSegments[2] === 'appointments') {
        const area = pathSegments[1] as AreaType
        if (areaData[area]) {
          // Adiciona a área apenas se não veio de outra área diferente
          if (!fromArea || fromArea === area) {
            breadcrumbs.push({
              label: areaData[area].name,
              href: `/dashboard/${area}`,
              icon: <span className="text-lg" role="img" aria-label={areaData[area].name}>{areaData[area].icon}</span>,
            })
          } else {
            // Se veio de outra área, adiciona ambas
            breadcrumbs.push({
              label: areaData[fromArea].name,
              href: `/dashboard/${fromArea}`,
              icon: <span className="text-lg" role="img" aria-label={areaData[fromArea].name}>{areaData[fromArea].icon}</span>,
            })
            breadcrumbs.push({
              label: areaData[area].name,
              href: `/dashboard/${area}?from=${fromArea}`,
              icon: <span className="text-lg" role="img" aria-label={areaData[area].name}>{areaData[area].icon}</span>,
            })
          }
          
          if (pathSegments[3] === 'new') {
            const queryParams = fromArea && fromArea !== area ? `?from=${fromArea}` : ''
            breadcrumbs.push({
              label: 'Novo Agendamento',
              href: `/dashboard/${area}/appointments/new${queryParams}`,
              icon: iconMap.new,
            })
          }
        }
      }
      // Pacientes
      else if (pathSegments[1] === 'patients') {
        const patientsHref = fromArea ? `/dashboard/patients?from=${fromArea}` : '/dashboard/patients'
        breadcrumbs.push({
          label: 'Pacientes',
          href: patientsHref,
          icon: iconMap.patients,
        })

        if (pathSegments[2] === 'new') {
          breadcrumbs.push({
            label: 'Novo',
            href: `${patientsHref}/new${fromArea ? `?from=${fromArea}` : ''}`,
            icon: iconMap.new,
          })
        } else if (pathSegments[3] === 'edit') {
          breadcrumbs.push({
            label: 'Editar',
            href: `${patientsHref}/${pathSegments[2]}/edit${fromArea ? `?from=${fromArea}` : ''}`,
            icon: iconMap.edit,
          })
        }
      }
      // Prontuários
      else if (pathSegments[1] === 'records') {
        const patientId = searchParams.get('patientId')
        const isViewingRecord = pathSegments[2] && !pathSegments[3] // Visualizando um prontuário específico
        const isEditingRecord = pathSegments[2] && pathSegments[3] === 'edit' // Editando um prontuário específico
        
        // Se veio de pacientes (tem patientId na query) OU está visualizando/editando um prontuário específico,
        // adiciona Pacientes no breadcrumb
        if (patientId || isViewingRecord || isEditingRecord) {
          const patientsHref = fromArea ? `/dashboard/patients?from=${fromArea}` : '/dashboard/patients'
          breadcrumbs.push({
            label: 'Pacientes',
            href: patientsHref,
            icon: iconMap.patients,
          })
        }

        // Construir href de prontuários preservando patientId e fromArea se houver
        const recordsQueryParams = new URLSearchParams()
        if (patientId) recordsQueryParams.set('patientId', patientId)
        if (fromArea) recordsQueryParams.set('from', fromArea)
        const recordsHref = `/dashboard/records${recordsQueryParams.toString() ? `?${recordsQueryParams.toString()}` : ''}`
        
        breadcrumbs.push({
          label: 'Prontuários',
          href: recordsHref,
          icon: iconMap.records,
        })

        if (pathSegments[2] === 'new') {
          breadcrumbs.push({
            label: 'Novo',
            href: `/dashboard/records/new${recordsQueryParams.toString() ? `?${recordsQueryParams.toString()}` : ''}`,
            icon: iconMap.new,
          })
        } else if (pathSegments[2] && pathSegments[3] === 'edit') {
          breadcrumbs.push({
            label: 'Editar',
            href: `/dashboard/records/${pathSegments[2]}/edit${recordsQueryParams.toString() ? `?${recordsQueryParams.toString()}` : ''}`,
            icon: iconMap.edit,
          })
        } else if (pathSegments[2] && !pathSegments[3]) {
          // Se não tem patientId na query mas está visualizando, tentar preservar na URL
          const viewQueryParams = new URLSearchParams()
          if (patientId) viewQueryParams.set('patientId', patientId)
          if (fromArea) viewQueryParams.set('from', fromArea)
          breadcrumbs.push({
            label: 'Visualizar',
            href: `/dashboard/records/${pathSegments[2]}${viewQueryParams.toString() ? `?${viewQueryParams.toString()}` : ''}`,
            icon: iconMap.view,
          })
        }
      }
    }

    setBreadcrumbs(breadcrumbs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams.toString()])
}
