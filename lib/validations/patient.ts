import { z } from 'zod'

export const patientSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().min(10, 'Telefone inválido').max(15, 'Telefone muito longo'),
  cpf: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido').optional().or(z.literal('')).refine(
    (val) => {
      if (!val || val === '') return true
      const numbers = val.replace(/\D/g, '')
      return numbers.length === 11 || numbers.length === 0
    },
    { message: 'CPF deve conter 11 dígitos' }
  ),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  sexo: z.enum(['M', 'F', 'Outro'], {
    errorMap: () => ({ message: 'Selecione uma opção válida' }),
  }),
  endereco: z.object({
    cep: z.string().min(8, 'CEP inválido').max(10, 'CEP inválido').optional().or(z.literal('')),
    rua: z.string().min(1, 'Rua é obrigatória').max(200, 'Rua muito longa'),
    numero: z.string().min(1, 'Número é obrigatório').max(20, 'Número muito longo'),
    complemento: z.string().max(100, 'Complemento muito longo').optional().or(z.literal('')),
    bairro: z.string().min(1, 'Bairro é obrigatório').max(100, 'Bairro muito longo'),
    cidade: z.string().min(1, 'Cidade é obrigatória').max(100, 'Cidade muito longa'),
    estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
  }),
  observacoes: z.string().max(500, 'Observações muito longas').optional().or(z.literal('')),
})

export type PatientInput = z.infer<typeof patientSchema>
