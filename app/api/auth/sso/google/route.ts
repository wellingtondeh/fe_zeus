import { NextResponse } from 'next/server'

export async function GET() {
  // Redirecionar para o provedor OAuth do Google
  // Em produção, você deve usar NextAuth ou implementar OAuth flow completo
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(
    {
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/sso/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    }
  ).toString()}`

  return NextResponse.redirect(googleAuthUrl)
}
