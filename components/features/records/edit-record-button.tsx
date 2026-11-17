'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface EditRecordButtonProps {
  recordId: string
  patientId: string
}

export function EditRecordButton({ recordId, patientId }: EditRecordButtonProps) {
  const searchParams = useSearchParams()
  
  // Preservar query params ao navegar para edição
  const queryParams = new URLSearchParams()
  queryParams.set('patientId', patientId)
  const fromArea = searchParams.get('from')
  if (fromArea) queryParams.set('from', fromArea)
  
  return (
    <Link href={`/dashboard/records/${recordId}/edit?${queryParams.toString()}`}>
      <Button variant="outline" size="sm" className="flex items-center gap-2">
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
      </Button>
    </Link>
  )
}
