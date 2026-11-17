'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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

export function EditPatientBreadcrumb() {
  const searchParams = useSearchParams()
  const fromArea = searchParams.get('from') as AreaType | null
  const areaInfo = fromArea && areaData[fromArea] ? areaData[fromArea] : null

  return (
    <div className="mb-6">
      <nav className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
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
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Dashboard
        </Link>
        <span className="text-gray-400">/</span>
        {areaInfo ? (
          <>
            <Link
              href={`/dashboard/${fromArea}`}
              className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
            >
              <span className="text-lg" role="img" aria-label={areaInfo.name}>
                {areaInfo.icon}
              </span>
              {areaInfo.name}
            </Link>
            <span className="text-gray-400">/</span>
          </>
        ) : null}
        <Link
          href={`/dashboard/patients${fromArea ? `?from=${fromArea}` : ''}`}
          className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
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
          Pacientes
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-blue-600 font-medium flex items-center gap-1">
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
          Editar
        </span>
      </nav>
    </div>
  )
}
