import { NextResponse } from 'next/server'

export async function GET() {
  // Redirecionar para o provedor OAuth da Microsoft
  const microsoftAuthUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${new URLSearchParams(
    {
      client_id: process.env.MICROSOFT_CLIENT_ID || '',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/sso/microsoft/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      response_mode: 'query',
    }
  ).toString()}`

  return NextResponse.redirect(microsoftAuthUrl)
}
