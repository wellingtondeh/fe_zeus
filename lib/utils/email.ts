/**
 * Valida se uma string é um email válido
 * Validação rigorosa seguindo RFC 5322 (simplificada)
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.trim() === '') {
    return false
  }
  
  const trimmedEmail = email.trim()
  
  // Verificar se tem exatamente um @
  const atCount = (trimmedEmail.match(/@/g) || []).length
  if (atCount !== 1) {
    return false
  }
  
  const [localPart, domain] = trimmedEmail.split('@')
  
  // Validar parte local (antes do @)
  if (!localPart || localPart.length === 0 || localPart.length > 64) {
    return false
  }
  
  // Parte local não pode começar ou terminar com ponto
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false
  }
  
  // Parte local não pode ter pontos consecutivos
  if (localPart.includes('..')) {
    return false
  }
  
  // Validar domínio
  if (!domain || domain.length === 0 || domain.length > 255) {
    return false
  }
  
  // Domínio não pode começar ou terminar com ponto ou hífen
  if (domain.startsWith('.') || domain.startsWith('-') || 
      domain.endsWith('.') || domain.endsWith('-')) {
    return false
  }
  
  // Domínio não pode ter pontos consecutivos
  if (domain.includes('..')) {
    return false
  }
  
  // Verificar se o domínio tem pelo menos um ponto (para TLD)
  if (!domain.includes('.')) {
    return false
  }
  
  // Dividir domínio em partes
  const domainParts = domain.split('.')
  
  // Deve ter pelo menos 2 partes (domínio + TLD) e no máximo 5 partes
  if (domainParts.length < 2 || domainParts.length > 5) {
    return false
  }
  
  // Validar cada parte do domínio
  for (const part of domainParts) {
    // Cada parte não pode estar vazia
    if (!part || part.length === 0) {
      return false
    }
    
    // Cada parte não pode começar ou terminar com hífen
    if (part.startsWith('-') || part.endsWith('-')) {
      return false
    }
    
    // Cada parte deve conter apenas letras, números e hífens
    if (!/^[a-zA-Z0-9-]+$/.test(part)) {
      return false
    }
    
    // Cada parte não pode exceder 63 caracteres
    if (part.length > 63) {
      return false
    }
  }
  
  // TLD (última parte) deve ter entre 2 e 63 caracteres e apenas letras
  const tld = domainParts[domainParts.length - 1]
  if (!tld || tld.length < 2 || tld.length > 63 || !/^[a-zA-Z]+$/.test(tld)) {
    return false
  }
  
  // Validação adicional: TLD muito longo pode ser suspeito
  // TLDs válidos geralmente têm entre 2 e 6 caracteres (alguns podem ter até 10-15)
  // Mas TLDs extremamente longos (> 15 caracteres) são suspeitos
  if (tld.length > 15) {
    return false
  }
  
  // Validação: se o domínio tiver mais de 3 partes, validar mais rigorosamente
  // Domínios com muitas partes podem ser suspeitos
  if (domainParts.length > 3) {
    // Verificar se alguma parte do domínio (exceto TLD) é muito longa (suspeito)
    for (const part of domainParts.slice(0, -1)) {
      // Partes muito longas (> 18 caracteres) em domínios com muitas partes são suspeitas
      if (part.length > 18) {
        return false
      }
    }
  }
  
  // Validação adicional: verificar padrões suspeitos
  // Domínios com muitas partes e partes muito longas são suspeitos
  if (domainParts.length >= 4) {
    // Contar quantas partes têm mais de 15 caracteres
    const longParts = domainParts.filter(part => part.length > 15).length
    // Se mais de uma parte for muito longa, é suspeito
    if (longParts > 1) {
      return false
    }
  }
  
  // Regex básica para formato geral (validação final)
  const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,63}$/
  
  if (!emailRegex.test(trimmedEmail)) {
    return false
  }
  
  // Validação adicional: verificar se não há caracteres inválidos
  // Não permite caracteres especiais além dos permitidos
  // Hífen deve estar no início ou fim da classe de caracteres para evitar interpretação como range
  const invalidChars = /[^a-zA-Z0-9._@-]/
  if (invalidChars.test(trimmedEmail)) {
    return false
  }
  
  return true
}
