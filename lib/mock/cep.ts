import type { MockApiResult } from './types'

export type ViaCepResponse = {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

/** Consulta ViaCEP direto no browser (sem API própria). */
export async function lookupCep(
  cep: string
): Promise<MockApiResult<ViaCepResponse>> {
  const cepClean = cep.replace(/\D/g, '')
  if (cepClean.length !== 8) {
    return {
      ok: false,
      status: 400,
      error: 'CEP inválido. Deve conter 8 dígitos.',
      code: 'INVALID_CEP',
    }
  }

  try {
    const response = await fetch(
      `https://viacep.com.br/ws/${cepClean}/json/`,
      { headers: { Accept: 'application/json' } }
    )

    if (!response.ok) {
      return {
        ok: false,
        status: 502,
        error: 'Erro ao buscar CEP. Tente novamente.',
        code: 'INTERNAL_ERROR',
      }
    }

    const data = (await response.json()) as ViaCepResponse
    if (data.erro) {
      return {
        ok: false,
        status: 404,
        error: 'CEP não encontrado',
        code: 'CEP_NOT_FOUND',
      }
    }

    return { ok: true, data }
  } catch {
    return {
      ok: false,
      status: 500,
      error: 'Erro ao buscar CEP. Tente novamente.',
      code: 'INTERNAL_ERROR',
    }
  }
}
