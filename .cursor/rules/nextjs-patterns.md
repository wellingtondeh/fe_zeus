# PadrÃµes Next.js 15

**Tipo:** Auto Attached  
**Aplica-se a:** `app/**/*.tsx`, `app/**/*.ts`  
**DescriÃ§Ã£o:** PadrÃµes e convenÃ§Ãµes especÃ­ficas do Next.js 15 - Server Components, Client Components, data fetching e otimizaÃ§Ã£o

## Server Components (PadrÃ£o)

Todo componente no Next.js 15 Ã© **Server Component por padrÃ£o**. Eles rodam apenas no servidor.

### Vantagens
- Acesso direto a banco de dados e APIs backend
- Zero JavaScript enviado ao cliente
- Melhor SEO e performance inicial
- Dados sempre atualizados

### Exemplo Correto

```typescript
// app/products/page.tsx
// âœ… Server Component (sem "use client")
async function ProductsPage() {
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 } // Revalidar a cada 1 hora
  }).then(r => r.json())

  return (
    <div>
      <h1>Produtos</h1>
      <ProductList products={products} />
    </div>
  )
}

export default ProductsPage
```

### Cache e RevalidaÃ§Ã£o

```typescript
// Cache indefinido (padrÃ£o para fetch)
fetch('https://api.example.com/data')

// Sem cache (sempre fresh)
fetch('https://api.example.com/data', { cache: 'no-store' })

// Revalidar apÃ³s X segundos
fetch('https://api.example.com/data', { 
  next: { revalidate: 60 } 
})

// Revalidar por tag
fetch('https://api.example.com/data', { 
  next: { tags: ['products'] } 
})
// Depois: revalidateTag('products')
```

### DeduplicaÃ§Ã£o com cache()

```typescript
import { cache } from 'react'

// Deduplica mÃºltiplas chamadas na mesma renderizaÃ§Ã£o
export const getUser = cache(async (id: string) => {
  const res = await fetch(`https://api.example.com/users/${id}`)
  return res.json()
})

// Usar em mÃºltiplos componentes - sÃ³ faz 1 request
async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId) // Request 1
  return <div>{user.name}</div>
}

async function UserAvatar({ userId }: { userId: string }) {
  const user = await getUser(userId) // Reutiliza cache
  return <img src={user.avatar} alt={user.name} />
}
```

## Client Components

Use **"use client"** apenas quando precisar de:
- Interatividade (onClick, onChange, etc)
- Hooks (useState, useEffect, useContext, etc)
- APIs do browser (localStorage, window, etc)
- Event listeners

### Quando Usar Client Components

```typescript
// âœ… CORRETO - Client Component
'use client'

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Contagem: {count}
    </button>
  )
}
```

### Manter Client Components Pequenos

```typescript
// âŒ INCORRETO - Todo o layout Ã© client
'use client'

export function ProductPage({ productId }: { productId: string }) {
  const [isLiked, setIsLiked] = useState(false)
  
  return (
    <div>
      <Header /> {/* NÃ£o precisa ser client */}
      <ProductDetails id={productId} /> {/* NÃ£o precisa ser client */}
      <LikeButton isLiked={isLiked} onToggle={() => setIsLiked(!isLiked)} />
      <Footer /> {/* NÃ£o precisa ser client */}
    </div>
  )
}

// âœ… CORRETO - Apenas botÃ£o Ã© client
export async function ProductPage({ productId }: { productId: string }) {
  const product = await getProduct(productId)
  
  return (
    <div>
      <Header />
      <ProductDetails product={product} />
      <LikeButton productId={productId} /> {/* SÃ³ este Ã© "use client" */}
      <Footer />
    </div>
  )
}

// components/like-button.tsx
'use client'
export function LikeButton({ productId }: { productId: string }) {
  const [isLiked, setIsLiked] = useState(false)
  return <button onClick={() => setIsLiked(!isLiked)}>â™¥</button>
}
```

## Loading e Error States

### loading.tsx

```typescript
// app/products/loading.tsx
export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 animate-pulse rounded" />
      <div className="h-64 bg-gray-200 animate-pulse rounded" />
    </div>
  )
}
```

### error.tsx

```typescript
// app/products/error.tsx
'use client' // Error components devem ser Client Components

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Algo deu errado!
      </h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Tentar novamente
      </button>
    </div>
  )
}
```

## Streaming com Suspense

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Carrega imediatamente */}
      <UserGreeting />
      
      {/* Stream quando estiver pronto */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <Analytics />
      </Suspense>
      
      <Suspense fallback={<RecentOrdersSkeleton />}>
        <RecentOrders />
      </Suspense>
    </div>
  )
}

async function Analytics() {
  const data = await fetchAnalytics() // Pode ser lento
  return <AnalyticsChart data={data} />
}

async function RecentOrders() {
  const orders = await fetchOrders() // Pode ser lento
  return <OrdersList orders={orders} />
}
```

## Dynamic Routes

```typescript
// app/products/[id]/page.tsx
interface ProductPageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id)
  
  return <ProductDetails product={product} />
}

// Gerar pÃ¡ginas estÃ¡ticas em build time
export async function generateStaticParams() {
  const products = await db.products.findMany()
  
  return products.map((product) => ({
    id: product.id,
  }))
}

// Metadata dinÃ¢mica
export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProduct(params.id)
  
  return {
    title: `${product.name} | Minha Loja`,
    description: product.description,
  }
}
```

## Server Actions

```typescript
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  
  await db.posts.create({
    data: { title, content }
  })
  
  revalidatePath('/posts')
}

// app/new-post/page.tsx
import { createPost } from '@/app/actions'

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Criar Post</button>
    </form>
  )
}
```

## OtimizaÃ§Ã£o de Performance

### next/image

```typescript
import Image from 'next/image'

export function ProductImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={500}
      height={500}
      priority // Para imagens above the fold
      placeholder="blur"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}
```

### Dynamic Imports

```typescript
import dynamic from 'next/dynamic'

// Lazy load de componentes pesados
const HeavyChart = dynamic(() => import('@/components/heavy-chart'), {
  loading: () => <p>Carregando grÃ¡fico...</p>,
  ssr: false // NÃ£o renderizar no servidor
})

export function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <HeavyChart />
    </div>
  )
}
```

### useTransition para Updates

```typescript
'use client'

import { useTransition } from 'react'
import { updateSettings } from '@/app/actions'

export function SettingsForm() {
  const [isPending, startTransition] = useTransition()
  
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        startTransition(async () => {
          await updateSettings(new FormData(e.currentTarget))
        })
      }}
    >
      <input name="theme" />
      <button disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  )
}
```
