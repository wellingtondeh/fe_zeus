/**
 * Quando as APIs reais e o SSO existirem em outros serviços,
 * configure estas variáveis no Azure Static Web Apps.
 *
 * NEXT_PUBLIC_API_BASE_URL  → ex: https://api.seudominio.com
 * NEXT_PUBLIC_SSO_BASE_URL  → ex: https://sso.seudominio.com/auth
 */
export function getApiBaseUrl(): string | undefined {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  return value || undefined
}

export function getSsoBaseUrl(): string | undefined {
  const value = process.env.NEXT_PUBLIC_SSO_BASE_URL?.trim()
  return value || undefined
}

export function useRemoteApi(): boolean {
  return Boolean(getApiBaseUrl())
}
