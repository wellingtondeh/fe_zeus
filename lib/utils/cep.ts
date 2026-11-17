/**
 * Aplica máscara de CEP no formato 00000-000
 */
export function applyCepMask(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '')
  
  // Aplica a máscara
  if (numbers.length <= 5) {
    return numbers
  }
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
}

/**
 * Remove máscara do CEP, retornando apenas números
 */
export function removeCepMask(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Valida formato de CEP (deve ter 8 dígitos)
 */
export function isValidCepFormat(cep: string): boolean {
  const numbers = removeCepMask(cep)
  return numbers.length === 8
}
