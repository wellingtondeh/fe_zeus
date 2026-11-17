import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cep: string }> }
) {
  try {
    const { cep } = await params
    
    // Remover máscara do CEP
    const cepClean = cep.replace(/\D/g, '')
    
    // Validar formato
    if (cepClean.length !== 8) {
      return NextResponse.json(
        {
          error: 'CEP inválido. Deve conter 8 dígitos.',
          code: 'INVALID_CEP',
        },
        { status: 400 }
      )
    }

    // Buscar no ViaCEP
    const response = await fetch(
      `https://viacep.com.br/ws/${cepClean}/json/`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: {
          revalidate: 86400, // Cache por 24 horas
        },
      }
    )

    if (!response.ok) {
      throw new Error('Erro ao buscar CEP')
    }

    const data = await response.json()

    if (data.erro) {
      return NextResponse.json(
        {
          error: 'CEP não encontrado',
          code: 'CEP_NOT_FOUND',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    return NextResponse.json(
      {
        error: 'Erro ao buscar CEP. Tente novamente.',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }
}
