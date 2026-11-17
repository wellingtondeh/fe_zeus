import { NextResponse } from 'next/server'

export async function GET() {
  // Instagram usa Facebook OAuth (mesmo sistema)
  // Redirecionar para o provedor OAuth do Facebook com escopo do Instagram
  const instagramAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?${new URLSearchParams(
    {
      client_id: process.env.INSTAGRAM_CLIENT_ID || process.env.FACEBOOK_CLIENT_ID || '',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/sso/instagram/callback`,
      response_type: 'code',
      scope: 'instagram_basic',
      state: crypto.randomUUID(), // CSRF protection
    }
  ).toString()}`

  return NextResponse.redirect(instagramAuthUrl)
}
