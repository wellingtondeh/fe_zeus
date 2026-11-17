/**
 * Aplica máscara de telefone no formato (00) 00000-0000 ou (00) 0000-0000
 */
export function applyPhoneMask(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '')
  
  // Limita a 11 dígitos (DDD + número)
  const limitedNumbers = numbers.slice(0, 11)
  
  // Aplica a máscara
  if (limitedNumbers.length <= 2) {
    return limitedNumbers.length > 0 ? `(${limitedNumbers}` : limitedNumbers
  } else if (limitedNumbers.length <= 6) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`
  } else if (limitedNumbers.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`
  } else {
    // Celular: (00) 00000-0000
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7, 11)}`
  }
}

/**
 * Remove máscara do telefone, retornando apenas números
 */
export function removePhoneMask(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Valida formato de telefone (deve ter 10 ou 11 dígitos)
 */
export function isValidPhoneFormat(phone: string): boolean {
  const numbers = removePhoneMask(phone)
  return numbers.length === 10 || numbers.length === 11
}
