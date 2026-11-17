/**
 * Aplica máscara de CNPJ no formato 00.000.000/0000-00
 */
export function applyCnpjMask(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '')
  
  // Limita a 14 dígitos
  const limitedNumbers = numbers.slice(0, 14)
  
  // Aplica a máscara
  if (limitedNumbers.length <= 2) {
    return limitedNumbers
  } else if (limitedNumbers.length <= 5) {
    return `${limitedNumbers.slice(0, 2)}.${limitedNumbers.slice(2)}`
  } else if (limitedNumbers.length <= 8) {
    return `${limitedNumbers.slice(0, 2)}.${limitedNumbers.slice(2, 5)}.${limitedNumbers.slice(5)}`
  } else if (limitedNumbers.length <= 12) {
    return `${limitedNumbers.slice(0, 2)}.${limitedNumbers.slice(2, 5)}.${limitedNumbers.slice(5, 8)}/${limitedNumbers.slice(8)}`
  } else {
    return `${limitedNumbers.slice(0, 2)}.${limitedNumbers.slice(2, 5)}.${limitedNumbers.slice(5, 8)}/${limitedNumbers.slice(8, 12)}-${limitedNumbers.slice(12, 14)}`
  }
}

/**
 * Remove máscara do CNPJ, retornando apenas números
 */
export function removeCnpjMask(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Valida formato de CNPJ (deve ter 14 dígitos)
 */
export function isValidCnpjFormat(cnpj: string): boolean {
  const numbers = removeCnpjMask(cnpj)
  return numbers.length === 14
}
