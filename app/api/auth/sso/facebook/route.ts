import { NextResponse } from 'next/server'

export async function GET() {
  // Redirecionar para o provedor OAuth do Facebook
  const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?${new URLSearchParams(
    {
      client_id: process.env.FACEBOOK_CLIENT_ID || '',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/sso/facebook/callback`,
      response_type: 'code',
      scope: 'email public_profile',
      state: crypto.randomUUID(), // CSRF protection
    }
  ).toString()}`

  return NextResponse.redirect(facebookAuthUrl)
}
