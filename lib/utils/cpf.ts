/**
 * Aplica máscara de CPF no formato 000.000.000-00
 */
export function applyCpfMask(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '')
  
  // Limita a 11 dígitos
  const limitedNumbers = numbers.slice(0, 11)
  
  // Aplica a máscara
  if (limitedNumbers.length <= 3) {
    return limitedNumbers
  } else if (limitedNumbers.length <= 6) {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3)}`
  } else if (limitedNumbers.length <= 9) {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6)}`
  } else {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6, 9)}-${limitedNumbers.slice(9, 11)}`
  }
}

/**
 * Remove máscara do CPF, retornando apenas números
 */
export function removeCpfMask(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Valida formato de CPF (deve ter 11 dígitos)
 */
export function isValidCpfFormat(cpf: string): boolean {
  const numbers = removeCpfMask(cpf)
  return numbers.length === 11
}
