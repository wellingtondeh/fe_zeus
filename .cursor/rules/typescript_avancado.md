# TypeScript AvanÃ§ado - Patterns Modernos

Especialista em TypeScript com type-safety extremo e patterns avanÃ§ados.

## ConfiguraÃ§Ã£o Strict

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## Branded Types (IDs type-safe)

```typescript
type UserId = string & { readonly brand: unique symbol }
type PostId = string & { readonly brand: unique symbol }

function createUserId(id: string): UserId {
  return id as UserId
}

function getUser(id: UserId) { } // SÃ³ aceita UserId!

const userId = createUserId('123')
const postId = '456' as PostId
getUser(userId) // âœ… OK
getUser(postId) // âŒ Error: PostId nÃ£o Ã© UserId
```

## Discriminated Unions (State Management)

```typescript
type LoadingState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }

function handleState<T>(state: LoadingState<T>) {
  switch (state.status) {
    case 'idle':
      return 'Waiting...'
    case 'loading':
      return 'Loading...'
    case 'success':
      return state.data // TypeScript sabe que data existe!
    case 'error':
      return state.error // TypeScript sabe que error existe!
  }
}
```

## Satisfies Operator (Type Narrowing)

```typescript
// Garante tipo mas mantÃ©m literal types
const routes = {
  home: '/',
  about: '/about',
  blog: '/blog/:id',
} satisfies Record<string, string>

// routes.home Ã© '/' (literal), nÃ£o string
type Route = typeof routes[keyof typeof routes] // '/' | '/about' | '/blog/:id'
```

## Template Literal Types

```typescript
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type ApiRoute = `/api/${string}`
type HttpEndpoint = `${HttpMethod} ${ApiRoute}`

// Uso:
const endpoint: HttpEndpoint = 'GET /api/users' // âœ…
const invalid: HttpEndpoint = 'PATCH /users' // âŒ
```

## Zod com TypeScript Integration

```typescript
import { z } from 'zod'

const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3),
  email: z.string().email(),
  role: z.enum(['admin', 'user'] as const),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// Infer types automaticamente
type User = z.infer<typeof userSchema>

// ValidaÃ§Ã£o type-safe
function validateUser(data: unknown): User {
  return userSchema.parse(data) // Throws se invÃ¡lido
}

// ValidaÃ§Ã£o segura
function safeValidateUser(data: unknown) {
  const result = userSchema.safeParse(data)
  if (result.success) {
    return result.data // Type: User
  }
  return result.error.flatten() // Type: ZodError
}
```

## Generic Constraints AvanÃ§ados

```typescript
// FunÃ§Ã£o que sÃ³ aceita objetos com id
function updateEntity<T extends { id: string }>(entity: T, updates: Partial<Omit<T, 'id'>>) {
  return { ...entity, ...updates }
}

// Tipo helper para extrair props de componente
type PropsOf<T> = T extends React.ComponentType<infer P> ? P : never

// Tipo helper para extrair return de funÃ§Ã£o async
type Awaited<T> = T extends Promise<infer U> ? U : T
```

## Utility Types Customizados

```typescript
// Required aninhado
type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends object ? DeepRequired<T[K]> : T[K]
}

// Readonly aninhado
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K]
}

// Extrair chaves de tipo especÃ­fico
type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]

type User = { id: string; name: string; age: number }
type StringKeys = KeysOfType<User, string> // 'id' | 'name'
```

## Type Guards AvanÃ§ados

```typescript
// Type guard com is
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

// Discriminated union guard
type Shape = 
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; size: number }

function isCircle(shape: Shape): shape is Extract<Shape, { kind: 'circle' }> {
  return shape.kind === 'circle'
}

function area(shape: Shape) {
  if (isCircle(shape)) {
    return Math.PI * shape.radius ** 2 // TypeScript sabe que Ã© circle!
  }
  return shape.size ** 2
}
```

## Const Assertions para Type-Safety

```typescript
// Sem as const
const colors1 = ['red', 'blue'] // Type: string[]

// Com as const
const colors2 = ['red', 'blue'] as const // Type: readonly ['red', 'blue']
type Color = typeof colors2[number] // 'red' | 'blue'

// Objeto com as const
const config = {
  api: 'https://api.example.com',
  timeout: 5000,
} as const

type Config = typeof config // { readonly api: "https://api.example.com", readonly timeout: 5000 }
```

## Conditional Types AvanÃ§ados

```typescript
// Tipo que remove null e undefined
type NonNullable<T> = T extends null | undefined ? never : T

// Tipo que extrai array element type
type ArrayElement<T> = T extends (infer U)[] ? U : never
type StringArray = ArrayElement<string[]> // string

// Tipo que converte union para intersection
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends 
  ((k: infer I) => void) ? I : never
```

## Regras de Ouro

1. âœ… SEMPRE habilite strict mode
2. âœ… Use branded types para IDs
3. âœ… Use discriminated unions para states complexos
4. âœ… Use satisfies para type narrowing
5. âœ… Use as const para literals
6. âœ… Valide com Zod e infira types
7. âœ… Crie type guards para narrowing
8. âŒ NUNCA use any (use unknown)
9. âŒ NUNCA use type assertion desnecessÃ¡rio (as)
10. âŒ NUNCA ignore erros de tipo
