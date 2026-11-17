# ConvenÃ§Ãµes Gerais do Projeto Next.js

**Tipo:** Always Apply  
**DescriÃ§Ã£o:** ConvenÃ§Ãµes gerais do projeto - stack, padrÃµes de cÃ³digo e prÃ¡ticas obrigatÃ³rias

> **Notas:**
> - Para verificações de qualidade de código (variáveis não utilizadas, possíveis undefined), consulte `.cursor/rules/code-quality.md`
> - Para padrões de validação de formulários com Zod, consulte `.cursor/rules/form-validation.md`
> - Para padrões de responsividade mobile, consulte `.cursor/rules/mobile-responsiveness.md`

## Stack e Ambiente

- **Next.js 15** com App Router (Pages Router estÃ¡ deprecado)
- **TypeScript** com strict mode habilitado
- **React 19** com Server Components como padrÃ£o
- **Tailwind CSS** para estilizaÃ§Ã£o
- **pnpm** como gerenciador de pacotes

## PadrÃµes de CÃ³digo

### Componentes
- Usar componentes funcionais com arrow functions
- Server Components por padrÃ£o; usar `"use client"` apenas quando necessÃ¡rio
- Nomenclatura: PascalCase para componentes, camelCase para funÃ§Ãµes/variÃ¡veis
- Arquivos de componente: `nome-do-componente.tsx` (kebab-case)
- **Usar named exports** (NÃƒO usar default exports)

```typescript
// âœ… CORRETO
export function ProductCard({ name, price }: ProductCardProps) {
  return <div>{name} - {price}</div>
}

// âŒ INCORRETO
export default function ProductCard({ name, price }: ProductCardProps) {
  return <div>{name} - {price}</div>
}
```

### Imports
- Usar imports absolutos com alias `@/` para `/src` ou raiz do projeto
- Organizar imports: externos â†’ internos â†’ tipos â†’ estilos

```typescript
// âœ… CORRETO
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { User } from '@/types/user'

// âŒ INCORRETO
import { Button } from '../../components/ui/button'
```

### TypeScript
- Sempre tipar props de componentes
- Usar `interface` para props e tipos de objetos
- Usar `type` para unions, intersections e tipos utilitÃ¡rios
- Evitar `any` - preferir `unknown` quando o tipo Ã© realmente desconhecido

```typescript
// âœ… CORRETO
interface UserCardProps {
  user: User
  onEdit?: (userId: string) => void
}

export function UserCard({ user, onEdit }: UserCardProps) {
  // ...
}

// âŒ INCORRETO
export function UserCard({ user, onEdit }: any) {
  // ...
}
```

## PadrÃµes DEPRECADOS - NÃƒO USAR

### âŒ Pages Router
```typescript
// DEPRECADO - NÃ£o usar mais
// pages/index.tsx
export default function Home() { }
```

Use **App Router** em `/app`:
```typescript
// âœ… app/page.tsx
export default function HomePage() { }
```

### âŒ Data Fetching Legado
```typescript
// DEPRECADO
export async function getServerSideProps() { }
export async function getStaticProps() { }
export async function getStaticPaths() { }
```

Use **fetch com cache options** ou **Server Components**:
```typescript
// âœ… CORRETO
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 }
  })
  return res.json()
}
```

### âŒ useEffect para Data Fetching
```typescript
// DEPRECADO
'use client'
function Products() {
  const [data, setData] = useState([])
  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setData)
  }, [])
}
```

Use **Server Components** ou bibliotecas modernas:
```typescript
// âœ… CORRETO - Server Component
async function Products() {
  const data = await fetch('/api/products').then(r => r.json())
  return <ProductList products={data} />
}

// âœ… CORRETO - Client Component com SWR/TanStack Query
'use client'
function Products() {
  const { data } = useSWR('/api/products', fetcher)
  return <ProductList products={data} />
}
```

### âŒ CSS Modules
```typescript
// DEPRECADO
import styles from './component.module.css'
```

Use **Tailwind CSS**:
```typescript
// âœ… CORRETO
export function Button() {
  return <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600">Click</button>
}
```

## Estrutura de Pastas

```
/app                    # App Router - rotas e layouts
  /api                  # API routes
  /(auth)              # Route groups
  layout.tsx           # Root layout
  page.tsx             # PÃ¡ginas
  loading.tsx          # Loading UI
  error.tsx            # Error boundaries

/components            # Componentes reutilizÃ¡veis
  /ui                  # Componentes base (buttons, inputs)
  /features            # Componentes de features especÃ­ficas

/lib                   # UtilitÃ¡rios e configuraÃ§Ãµes
  /utils               # FunÃ§Ãµes helper
  /hooks               # Custom hooks

/types                 # DefiniÃ§Ãµes de tipos TypeScript

/public                # Assets estÃ¡ticos
```

## EstilizaÃ§Ã£o com Tailwind

- Usar classes utilitÃ¡rias do Tailwind como padrÃ£o
- Criar componentes reutilizÃ¡veis para padrÃµes repetidos
- Usar `cn()` helper para classes condicionais
- **Mobile-first:** Sempre desenvolver para mobile primeiro, depois adaptar para desktop

```typescript
import { cn } from '@/lib/utils'

export function Alert({ variant, className, children }: AlertProps) {
  return (
    <div className={cn(
      'rounded-lg border p-4',
      variant === 'error' && 'border-red-500 bg-red-50',
      variant === 'success' && 'border-green-500 bg-green-50',
      className
    )}>
      {children}
    </div>
  )
}
```

### Padrões Mobile-First

**Tamanhos de Fonte:**
- Tabelas: `text-base sm:text-sm` (maior no mobile)
- Cabeçalhos de tabela: `text-sm sm:text-xs`
- Textos secundários: `text-sm sm:text-sm` ou `text-xs sm:text-sm`

**Botões em Tabelas/Listagens:**
- Mobile: `h-10 w-10` com ícones `h-5 w-5`
- Desktop: `h-auto w-auto` com ícones `h-4 w-4`
- Textos: `hidden sm:inline` para ocultar no mobile

## Performance e SEO

- Usar `next/image` para todas as imagens
- Implementar metadata apropriada em cada pÃ¡gina
- Usar Suspense boundaries para loading states
- Implementar error boundaries em nÃ­veis apropriados

```typescript
// app/products/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Produtos | Minha Loja',
  description: 'Explore nosso catÃ¡logo de produtos',
}

export default function ProductsPage() {
  return <ProductList />
}
```
