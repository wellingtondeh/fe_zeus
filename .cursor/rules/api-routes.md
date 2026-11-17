# API Routes (Route Handlers)

**Tipo:** Auto Attached  
**Aplica-se a:** `app/api/**/*.ts`, `app/api/**/*.tsx`  
**DescriÃ§Ã£o:** PadrÃµes para Route Handlers - validaÃ§Ã£o, tratamento de erros, seguranÃ§a e boas prÃ¡ticas

## Estrutura Base

```typescript
// app/api/products/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'

// GET /api/products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    const products = await db.products.findMany({
      where: category ? { category } : undefined,
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
      },
    })
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    )
  }
}

// POST /api/products
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // ValidaÃ§Ã£o
    const schema = z.object({
      name: z.string().min(1, 'Nome Ã© obrigatÃ³rio'),
      price: z.number().positive('PreÃ§o deve ser positivo'),
      category: z.string(),
    })
    
    const data = schema.parse(body)
    
    const product = await db.products.create({ data })
    
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados invÃ¡lidos', issues: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Erro ao criar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    )
  }
}
```

## ValidaÃ§Ã£o com Zod

### Schema de ValidaÃ§Ã£o

```typescript
import { z } from 'zod'

// Schemas reutilizÃ¡veis
const userSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mÃ­nimo 2 caracteres'),
  email: z.string().email('Email invÃ¡lido'),
  age: z.number().int().positive().optional(),
})

const productSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  description: z.string().max(500),
  category: z.enum(['electronics', 'clothing', 'food']),
  tags: z.array(z.string()).optional(),
  inStock: z.boolean().default(true),
})

// POST /api/users
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = userSchema.parse(body)
    
    // Usar validatedData (tipado automaticamente)
    const user = await createUser(validatedData)
    
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'ValidaÃ§Ã£o falhou',
          issues: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}
```

### ValidaÃ§Ã£o de Query Params

```typescript
// GET /api/products?page=1&limit=10&sort=price
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const querySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sort: z.enum(['price', 'name', 'createdAt']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  })
  
  try {
    const params = querySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sort: searchParams.get('sort'),
      order: searchParams.get('order'),
    })
    
    const products = await db.products.findMany({
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { [params.sort]: params.order },
    })
    
    return NextResponse.json(products)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'ParÃ¢metros invÃ¡lidos', issues: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    )
  }
}
```

## Routes DinÃ¢micas

```typescript
// app/api/products/[id]/route.ts

interface RouteContext {
  params: { id: string }
}

// GET /api/products/:id
export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const product = await db.products.findUnique({
      where: { id: params.id },
    })
    
    if (!product) {
      return NextResponse.json(
        { error: 'Produto nÃ£o encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produto' },
      { status: 500 }
    )
  }
}

// PUT /api/products/:id
export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  try {
    const body = await request.json()
    const data = productSchema.partial().parse(body)
    
    const product = await db.products.update({
      where: { id: params.id },
      data,
    })
    
    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados invÃ¡lidos', issues: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erro ao atualizar produto' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/:id
export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    await db.products.delete({
      where: { id: params.id },
    })
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao deletar produto' },
      { status: 500 }
    )
  }
}
```

## AutenticaÃ§Ã£o e AutorizaÃ§Ã£o

```typescript
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
    })
    return user
  } catch {
    return null
  }
}

// app/api/profile/route.ts
import { getCurrentUser } from '@/lib/auth'

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

// app/api/admin/users/route.ts
export async function GET(request: Request) {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json(
      { error: 'NÃ£o autenticado' },
      { status: 401 }
    )
  }
  
  if (user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Sem permissÃ£o' },
      { status: 403 }
    )
  }
  
  const users = await db.users.findMany()
  return NextResponse.json(users)
}
```

## CORS e Headers

```typescript
// app/api/public/route.ts
export async function GET(request: Request) {
  const data = { message: 'API pÃºblica' }
  
  return NextResponse.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
```

## Edge Runtime

```typescript
// app/api/edge/route.ts
export const runtime = 'edge' // 'nodejs' (default) | 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name') || 'World'
  
  return NextResponse.json({
    message: `Hello, ${name}!`,
    timestamp: new Date().toISOString(),
  })
}
```

## Tratamento de Erros Padronizado

```typescript
// lib/api-error.ts
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// lib/error-handler.ts
export function handleApiError(error: unknown) {
  console.error('API Error:', error)
  
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }
  
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'ValidaÃ§Ã£o falhou',
        issues: error.issues,
      },
      { status: 400 }
    )
  }
  
  // Erro genÃ©rico
  return NextResponse.json(
    { error: 'Erro interno do servidor' },
    { status: 500 }
  )
}

// app/api/products/route.ts
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = productSchema.parse(body)
    
    if (await productExists(data.name)) {
      throw new ApiError('Produto jÃ¡ existe', 409, 'PRODUCT_EXISTS')
    }
    
    const product = await db.products.create({ data })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
```

## Checklist de API Route

- [ ] ValidaÃ§Ã£o de entrada com Zod
- [ ] Tratamento de erros adequado
- [ ] Status codes HTTP corretos
- [ ] AutenticaÃ§Ã£o/autorizaÃ§Ã£o quando necessÃ¡rio
- [ ] CORS configurado se necessÃ¡rio
- [ ] Logs de erro para debugging
- [ ] Tipos TypeScript para request/response
- [ ] DocumentaÃ§Ã£o de erros possÃ­veis
