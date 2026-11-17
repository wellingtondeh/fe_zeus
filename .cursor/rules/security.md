# SeguranÃ§a Frontend Next.js

**Tipo:** Always Apply  
**DescriÃ§Ã£o:** Regras e prÃ¡ticas de seguranÃ§a para aplicaÃ§Ãµes Next.js - validaÃ§Ã£o, sanitizaÃ§Ã£o, headers, autenticaÃ§Ã£o e proteÃ§Ã£o contra vulnerabilidades comuns

## PrincÃ­pios Fundamentais

1. **ValidaÃ§Ã£o Server-Side SEMPRE** - Nunca confie em validaÃ§Ã£o apenas no cliente
2. **SanitizaÃ§Ã£o de Entrada** - Sempre sanitize dados do usuÃ¡rio antes de renderizar
3. **PrincÃ­pio do Menor PrivilÃ©gio** - Acesso mÃ­nimo necessÃ¡rio
4. **Defesa em Profundidade** - MÃºltiplas camadas de seguranÃ§a
5. **SeguranÃ§a por PadrÃ£o** - ConfiguraÃ§Ãµes seguras como padrÃ£o

## ValidaÃ§Ã£o e SanitizaÃ§Ã£o

### ValidaÃ§Ã£o com Zod (ObrigatÃ³rio)

````typescript
// âœ… CORRETO - ValidaÃ§Ã£o server-side
import { z } from 'zod'

const userSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().positive().max(120),
})

// app/api/users/route.ts
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = userSchema.parse(body) // Valida e tipa
    
    const user = await createUser(validatedData)
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados invÃ¡lidos', issues: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}

// âŒ INCORRETO - Sem validaÃ§Ã£o
export async function POST(request: Request) {
  const body = await request.json()
  const user = await createUser(body) // PERIGOSO!
  return NextResponse.json(user)
}
````

### SanitizaÃ§Ã£o de HTML (XSS Prevention)

````typescript
import DOMPurify from 'isomorphic-dompurify'

// âœ… CORRETO - Sanitizar HTML antes de renderizar
export function UserComment({ content }: { content: string }) {
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href'],
  })
  
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
}

// âœ… MELHOR - Evitar dangerouslySetInnerHTML quando possÃ­vel
export function UserComment({ content }: { content: string }) {
  return <div>{content}</div> // React escapa automaticamente
}

// âŒ INCORRETO - Renderizar HTML nÃ£o sanitizado
export function UserComment({ content }: { content: string }) {
  return <div dangerouslySetInnerHTML={{ __html: content }} /> // XSS!
}
````

## ProteÃ§Ã£o contra XSS (Cross-Site Scripting)

### React Escapa Automaticamente

````typescript
// âœ… CORRETO - React escapa automaticamente
export function UserProfile({ name }: { name: string }) {
  return <h1>{name}</h1> // Seguro - React escapa
}

// âš ï¸ CUIDADO - dangerouslySetInnerHTML requer sanitizaÃ§Ã£o
export function RichText({ html }: { html: string }) {
  const sanitized = DOMPurify.sanitize(html)
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
}
````

## CSRF Protection

### Next.js com Server Actions (ProteÃ§Ã£o AutomÃ¡tica)

````typescript
// âœ… CORRETO - Server Actions tÃªm proteÃ§Ã£o CSRF automÃ¡tica
'use server'

import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  // Next.js valida CSRF token automaticamente
  const name = formData.get('name') as string
  
  if (!name || name.length < 2) {
    return { error: 'Nome invÃ¡lido' }
  }
  
  await db.user.update({ where: { id: userId }, data: { name } })
  revalidatePath('/profile')
  
  return { success: true }
}
````

## Headers de SeguranÃ§a

### next.config.js

````typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.example.com",
    ].join('; ')
  },
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
````

## VariÃ¡veis de Ambiente

### Nunca Expor Secrets no Cliente

````typescript
// âœ… CORRETO - VariÃ¡veis pÃºblicas com prefixo NEXT_PUBLIC_
// .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
DATABASE_URL=postgresql://... # NÃƒO usar NEXT_PUBLIC_!

// âŒ INCORRETO - Nunca fazer isso
NEXT_PUBLIC_SECRET_KEY=sk_live_1234567890 // PERIGOSO!
NEXT_PUBLIC_DATABASE_PASSWORD=senha123 // PERIGO!

// âœ… CORRETO - Secrets apenas no servidor
// app/api/route.ts
export async function GET() {
  const secret = process.env.SECRET_KEY // NÃ£o tem NEXT_PUBLIC_
  // Usar secret apenas no servidor
}
````

### ValidaÃ§Ã£o de Environment Variables

````typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SECRET_KEY: z.string().min(32),
  NEXT_PUBLIC_API_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)

// Usar env validado em vez de process.env diretamente
import { env } from '@/lib/env'

export async function connectDatabase() {
  return connect(env.DATABASE_URL) // Tipado e validado
}
````

## AutenticaÃ§Ã£o e AutorizaÃ§Ã£o

### VerificaÃ§Ã£o de AutenticaÃ§Ã£o

````typescript
// lib/auth.ts
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

export async function getCurrentUser() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) {
    return null
  }
  
  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string }
    const user = await db.users.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        // NÃ£o retornar senha ou dados sensÃ­veis
      },
    })
    return user
  } catch {
    return null
  }
}

// âœ… CORRETO - Verificar autenticaÃ§Ã£o em API routes
export async function GET(request: Request) {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json(
      { error: 'NÃ£o autenticado' },
      { status: 401 }
    )
  }
  
  return NextResponse.json({ user })
}
````

### AutorizaÃ§Ã£o Baseada em Roles

````typescript
// lib/auth.ts
export async function requireRole(allowedRoles: string[]) {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('NÃ£o autenticado')
  }
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Sem permissÃ£o')
  }
  
  return user
}

// app/api/admin/users/route.ts
export async function GET(request: Request) {
  try {
    const user = await requireRole(['admin', 'super-admin'])
    
    const users = await db.users.findMany({
      select: {
        id: true,
        email: true,
        // NÃ£o retornar dados sensÃ­veis
      },
    })
    
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 403 }
    )
  }
}
````

## Rate Limiting

````typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache'

type RateLimitOptions = {
  interval: number
  uniqueTokenPerInterval: number
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  })

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0]
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount)
        }
        tokenCount[0] += 1

        const currentUsage = tokenCount[0]
        const isRateLimited = currentUsage >= limit

        return isRateLimited ? reject() : resolve()
      }),
  }
}

// app/api/auth/login/route.ts
const limiter = rateLimit({
  interval: 60 * 1000, // 60 segundos
  uniqueTokenPerInterval: 500,
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'anonymous'
  
  try {
    await limiter.check(5, ip) // 5 tentativas por minuto
  } catch {
    return NextResponse.json(
      { error: 'Rate limit excedido. Tente novamente em alguns instantes.' },
      { status: 429 }
    )
  }
  
  // Continuar com login...
}
````

## ProteÃ§Ã£o contra SQL Injection

### Usar ORM/Query Builder (Prisma)

````typescript
// âœ… CORRETO - Prisma previne SQL injection
export async function getUser(id: string) {
  return db.user.findUnique({
    where: { id }, // Prisma escapa automaticamente
  })
}

// âœ… CORRETO - Usar parÃ¢metros preparados se usar SQL raw
export async function searchUsers(query: string) {
  return db.$queryRaw`
    SELECT * FROM users 
    WHERE name LIKE ${`%${query}%`}
  ` // Prisma escapa automaticamente
}

// âŒ INCORRETO - Nunca fazer concatenaÃ§Ã£o de strings
export async function getUser(id: string) {
  return db.$queryRaw(`SELECT * FROM users WHERE id = '${id}'`) // SQL INJECTION!
}
````

## Cookies Seguros

````typescript
// âœ… CORRETO - Cookies seguros
import { cookies } from 'next/headers'

export async function setAuthCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set('token', token, {
    httpOnly: true, // NÃ£o acessÃ­vel via JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS apenas
    sameSite: 'strict', // ProteÃ§Ã£o CSRF
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/',
  })
}

// âŒ INCORRETO - Cookie inseguro
cookieStore.set('token', token) // Sem flags de seguranÃ§a!
````

## Checklist de SeguranÃ§a

Antes de fazer deploy, verificar:

- [ ] Todas as entradas validadas com Zod (server-side)
- [ ] HTML sanitizado antes de renderizar (DOMPurify)
- [ ] Headers de seguranÃ§a configurados (CSP, HSTS, etc)
- [ ] VariÃ¡veis de ambiente validadas e secrets nÃ£o expostos
- [ ] AutenticaÃ§Ã£o e autorizaÃ§Ã£o implementadas corretamente
- [ ] Rate limiting em endpoints pÃºblicos
- [ ] CSRF protection em formulÃ¡rios
- [ ] Cookies configurados com flags de seguranÃ§a
- [ ] Uploads validados (tipo, tamanho, nome sanitizado)
- [ ] SQL injection prevenido (usar ORM/parÃ¢metros preparados)
- [ ] XSS prevenido (React escapa, sanitizar quando necessÃ¡rio)
- [ ] DependÃªncias atualizadas (pnpm audit)
- [ ] Secrets nunca commitados no cÃ³digo
- [ ] HTTPS em produÃ§Ã£o
- [ ] Logs nÃ£o expÃµem dados sensÃ­veis

## Regras de Ouro

1. âœ… **Valide SEMPRE no servidor** - Nunca confie apenas no cliente
2. âœ… **Sanitize antes de renderizar** - Especialmente HTML e URLs
3. âœ… **Use HTTPS em produÃ§Ã£o** - Sempre
4. âœ… **Nunca exponha secrets** - Use variÃ¡veis de ambiente sem NEXT_PUBLIC_
5. âœ… **Implemente rate limiting** - Proteja contra abuso
6. âœ… **Configure headers de seguranÃ§a** - CSP, HSTS, etc
7. âœ… **Use ORM/Query Builder** - Previne SQL injection
8. âœ… **AutenticaÃ§Ã£o segura** - JWT com httpOnly cookies
9. âŒ **NUNCA** confie em validaÃ§Ã£o apenas no cliente
10. âŒ **NUNCA** renderize HTML nÃ£o sanitizado
11. âŒ **NUNCA** exponha secrets no cÃ³digo ou client-side
12. âŒ **NUNCA** faÃ§a concatenaÃ§Ã£o de strings em queries SQL
