'use client'

import { useRef, useState, useCallback } from 'react'
import {
  isAllowedRecordAttachment,
  RECORD_FILE_ACCEPT,
} from '@/lib/utils/record-file-accept'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export interface RecordFileUploadProps {
  files: File[]
  onAddFiles: (files: File[]) => void
  onRemoveAt: (index: number) => void
  disabled?: boolean
}

export function RecordFileUpload({
  files,
  onAddFiles,
  onRemoveAt,
  disabled,
}: RecordFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [rejectHint, setRejectHint] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const processFileList = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return
      const accepted: File[] = []
      const rejected: string[] = []
      for (const f of Array.from(list)) {
        if (isAllowedRecordAttachment(f)) accepted.push(f)
        else rejected.push(f.name)
      }
      if (rejected.length) {
        setRejectHint(
          `Arquivo(s) não aceito(s) (tipos permitidos: Office exceto Access, PDF, imagens): ${rejected.join(', ')}`
        )
      } else {
        setRejectHint(null)
      }
      if (accepted.length) onAddFiles(accepted)
      if (inputRef.current) inputRef.current.value = ''
    },
    [onAddFiles]
  )

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFileList(e.target.files)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    processFileList(e.dataTransfer.files)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  return (
    <div className="flex flex-col gap-3 m-0 p-0">
      <div className="m-0 p-0">
        <span className="block text-sm font-medium text-gray-700 mb-1.5">
          Anexos
        </span>
        <p className="m-0 text-xs text-gray-500">
          Microsoft Office (Word, Excel, PowerPoint, etc., exceto Access), PDF e
          imagens.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (disabled) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={[
          'flex min-h-[200px] flex-col items-center justify-start rounded-lg border-2 border-dashed px-6 pt-6 pb-3 text-center transition-colors lg:min-h-[400px]',
          disabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60'
            : 'cursor-pointer',
          !disabled && isDragging && 'border-blue-500 bg-blue-50',
          !disabled &&
            !isDragging &&
            'border-gray-300 bg-gray-50/80 hover:border-blue-400 hover:bg-blue-50/30',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="Área para envio de arquivos. Clique ou arraste documentos aqui."
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={RECORD_FILE_ACCEPT}
          multiple
          disabled={disabled}
          onChange={onInputChange}
          tabIndex={-1}
        />
        <div className="flex w-full flex-col items-center gap-2">
          <svg
            className="h-10 w-10 shrink-0 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="m-0 text-sm text-gray-600">
            <span className="font-medium text-blue-600">Clique para selecionar</span>
            {' ou arraste arquivos para esta área'}
          </p>
          <p className="m-0 text-xs text-gray-500">
            Vários arquivos permitidos
          </p>
        </div>
      </div>

      {rejectHint && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2" role="status">
          {rejectHint}
        </p>
      )}

      {files.length > 0 && (
        <ul className="space-y-2 rounded-md border border-gray-200 bg-white divide-y divide-gray-100">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
            >
              <span className="truncate text-gray-900" title={file.name}>
                {file.name}
              </span>
              <span className="flex flex-shrink-0 items-center gap-3">
                <span className="text-gray-500 tabular-nums">
                  {formatFileSize(file.size)}
                </span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveAt(index)
                  }}
                  className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                  aria-label={`Remover ${file.name}`}
                >
                  <svg
                    className="h-5 w-5"
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
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
