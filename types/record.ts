export interface MedicalRecord {
  id: string
  patientId: string
  patientName: string
  title: string
  content: string // HTML content from rich text editor
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface MedicalRecordInput {
  patientId: string
  title: string
  content: string
}
