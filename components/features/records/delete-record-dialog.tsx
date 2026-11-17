'use client'

import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DeleteRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  recordTitle: string
}

export function DeleteRecordDialog({
  open,
  onOpenChange,
  onConfirm,
  recordTitle,
}: DeleteRecordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-md p-6">
        <Dialog.Header>
          <Dialog.Title className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Excluir Prontuário
          </Dialog.Title>
        </Dialog.Header>
        <div className="py-4">
          <p className="text-gray-700">
            Tem certeza que deseja excluir o prontuário{' '}
            <strong>&quot;{recordTitle}&quot;</strong>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Esta ação não pode ser desfeita.
          </p>
        </div>
        <Dialog.Footer>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            aria-label="Cancelar exclusão"
            className="flex items-center gap-2"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            aria-label="Confirmar exclusão"
            className="flex items-center gap-2"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Excluir
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  )
}
