import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      `/login?error=${encodeURIComponent('Erro ao autenticar com Facebook')}`
    )
  }

  if (!code) {
    return NextResponse.redirect(
      `/login?error=${encodeURIComponent('Código de autorização não recebido')}`
    )
  }

  // TODO: Implementar troca de código por token e criação de sessão
  return NextResponse.redirect('/dashboard')
}
