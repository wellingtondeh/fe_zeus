export interface Patient {
  id: string
  nome: string
  email?: string
  telefone: string
  cpf?: string
  dataNascimento: string
  sexo: 'M' | 'F' | 'Outro'
  endereco: {
    cep?: string
    rua: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
  }
  observacoes?: string
  createdAt: string
  updatedAt: string
}
