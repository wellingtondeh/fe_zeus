import { z } from 'zod'

// Schema para agendamento móvel
export const mobileAppointmentSchema = z.object({
  mobileAppointmentType: z.enum(['experimental', 'renovacao', 'aula-inaugural', 'reposicao', 'convenio'], {
    errorMap: () => ({ message: 'Selecione o tipo de agendamento móvel' }),
  }),
  selectedDate: z.date({
    required_error: 'Selecione uma data',
  }),
  selectedTime: z.string().min(1, 'Selecione um horário'),
  selectedProfessional: z.string().min(1, 'Selecione um profissional'),
  patientName: z.string().optional(),
  patientPhone: z.string().optional(),
  patientEmail: z.string().optional(),
  patientId: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validações específicas por tipo
  if (data.mobileAppointmentType === 'renovacao' || 
      data.mobileAppointmentType === 'aula-inaugural' || 
      data.mobileAppointmentType === 'reposicao') {
    if (!data.patientId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['patientId'],
        message: 'Selecione um paciente/aluno',
      })
    }
    if (!data.patientName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['patientName'],
        message: 'Selecione um paciente/aluno',
      })
    }
  } else if (data.mobileAppointmentType === 'experimental' || data.mobileAppointmentType === 'convenio') {
    if (!data.patientName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['patientName'],
        message: 'Informe o nome do paciente',
      })
    }
    if (!data.patientPhone?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['patientPhone'],
        message: 'Informe o telefone do paciente',
      })
    }
  }
})

// Schema para agendamento fixo
export const fixedAppointmentSchema = z.object({
  fixedAppointmentType: z.enum(['particular', 'convenio'], {
    errorMap: () => ({ message: 'Selecione o tipo de aluno' }),
  }),
  selectedDays: z.array(z.number()).min(1, 'Selecione pelo menos um dia da semana'),
  selectedTime: z.string().min(1, 'Selecione um horário'),
  selectedProfessional: z.string().min(1, 'Selecione um profissional'),
  patientName: z.string().optional(),
  patientEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  patientId: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validações específicas por tipo
  if (data.fixedAppointmentType === 'particular') {
    if (!data.patientId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['patientId'],
        message: 'Selecione um aluno',
      })
    }
    if (!data.patientName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['patientName'],
        message: 'Selecione um aluno',
      })
    }
  } else if (data.fixedAppointmentType === 'convenio') {
    if (!data.patientName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['patientName'],
        message: 'Informe o nome do aluno',
      })
    }
    if (!data.patientEmail?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['patientEmail'],
        message: 'Informe o email do aluno',
      })
    } else if (data.patientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.patientEmail)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['patientEmail'],
        message: 'Email inválido',
      })
    }
  }
})

// Schema para agendamento móvel simples (áreas que não são Pilates)
export const simpleMobileAppointmentSchema = z.object({
  selectedDate: z.date({
    required_error: 'Selecione uma data',
  }),
  selectedTime: z.string().min(1, 'Selecione um horário'),
  selectedProfessional: z.string().min(1, 'Selecione um profissional'),
  patientName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  patientPhone: z.string().min(10, 'Telefone inválido').max(15, 'Telefone muito longo'),
  patientEmail: z.string().email('Email inválido').optional().or(z.literal('')),
})

export type MobileAppointmentInput = z.infer<typeof mobileAppointmentSchema>
export type FixedAppointmentInput = z.infer<typeof fixedAppointmentSchema>
export type SimpleMobileAppointmentInput = z.infer<typeof simpleMobileAppointmentSchema>
