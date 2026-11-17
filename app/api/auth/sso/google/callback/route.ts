import { NextResponse } from 'next/server'

// Esta rota deve processar o callback do Google OAuth
// Em produção, você deve:
// 1. Validar o código recebido
// 2. Trocar o código por um access token
// 3. Buscar informações do usuário
// 4. Criar/sincronizar usuário no banco de dados
// 5. Criar sessão JWT
// 6. Redirecionar para a página inicial ou dashboard

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      `/login?error=${encodeURIComponent('Erro ao autenticar com Google')}`
    )
  }

  if (!code) {
    return NextResponse.redirect(
      `/login?error=${encodeURIComponent('Código de autorização não recebido')}`
    )
  }

  // TODO: Implementar troca de código por token e criação de sessão
  // Por enquanto, apenas redireciona
  return NextResponse.redirect('/dashboard')
}
