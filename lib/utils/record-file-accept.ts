/** Extensões do Microsoft Access — não permitidas */
const ACCESS_EXTENSIONS = new Set([
  'mdb',
  'accdb',
  'mde',
  'mda',
  'ade',
  'adp',
])

/** Documentos típicos do Microsoft Office (Word, Excel, PowerPoint, Visio, Publisher, OneNote) */
const OFFICE_EXTENSIONS = new Set([
  'doc',
  'docx',
  'dot',
  'dotx',
  'rtf',
  'xls',
  'xlsx',
  'xlsm',
  'xlsb',
  'xltx',
  'ppt',
  'pptx',
  'pptm',
  'potx',
  'pps',
  'ppsx',
  'vsd',
  'vsdx',
  'vsdm',
  'pub',
  'one',
])

export function getFileExtension(name: string): string {
  const parts = name.split('.')
  if (parts.length < 2) return ''
  return parts.pop()!.toLowerCase()
}

/**
 * Office (exceto Access), PDF ou imagem.
 */
export function isAllowedRecordAttachment(file: File): boolean {
  const ext = getFileExtension(file.name)
  if (ACCESS_EXTENSIONS.has(ext)) return false
  if (OFFICE_EXTENSIONS.has(ext)) return true
  if (ext === 'pdf' || file.type === 'application/pdf') return true
  if (file.type.startsWith('image/')) return true
  return false
}

/** Valor do atributo `accept` do input file (filtro inicial do SO) */
export const RECORD_FILE_ACCEPT =
  [
    'image/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.doc',
    '.docx',
    '.dot',
    '.dotx',
    '.rtf',
    '.xls',
    '.xlsx',
    '.xlsm',
    '.xlsb',
    '.ppt',
    '.pptx',
    '.pptm',
    '.vsd',
    '.vsdx',
    '.pub',
    '.one',
    '.pdf',
  ].join(',')
