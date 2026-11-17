# Padrões de Navegação e Breadcrumbs

**Tipo:** Auto Attached  
**Aplica-se a:** `app/**/*.tsx`, `components/**/*.tsx`, `hooks/**/*.tsx`, `contexts/**/*.tsx`  
**Descrição:** Padrões para sistema de breadcrumbs centralizado, preservação de query params e navegação entre páginas

## Visão Geral do Sistema

O projeto utiliza um sistema centralizado de breadcrumbs baseado em React Context que:
- Constrói breadcrumbs dinamicamente baseado na rota atual
- Preserva contexto de navegação através de query params (`from`, `patientId`)
- Mantém consistência visual e funcional em todas as páginas do dashboard
- Não utiliza sessionStorage (elementos React não são serializáveis)

### Arquitetura

```
BreadcrumbProvider (Context)
  └── BreadcrumbWrapper (Suspense + Hook)
      └── useBreadcrumbSetup (Analisa rota)
          └── Breadcrumb (Renderiza)
```

## BreadcrumbProvider e Context

### Localização
`contexts/breadcrumb-context.tsx`

### Configuração

O `BreadcrumbProvider` deve estar no layout raiz (`app/layout.tsx`):

```typescript
import { BreadcrumbProvider } from '@/contexts/breadcrumb-context'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <BreadcrumbProvider>
          {children}
        </BreadcrumbProvider>
      </body>
    </html>
  )
}
```

### Interface BreadcrumbItem

```typescript
export interface BreadcrumbItem {
  label: string
  href: string
  icon?: ReactNode  // Elementos React - não serializáveis
}
```

### Regras Importantes

- **NÃO usar sessionStorage**: Elementos React (ícones) não podem ser serializados com `JSON.stringify()`
- **Estado gerenciado via Context**: Breadcrumbs são reconstruídos dinamicamente pelo hook `useBreadcrumbSetup`
- **Comparação de dados serializáveis**: Ao comparar breadcrumbs para evitar loops, usar apenas `label` e `href` (sem `icon`)

```typescript
// ✓ CORRETO - Comparar apenas dados serializáveis
const prevSerializable = prev.map(({ icon, ...rest }) => rest)
const newSerializable = newBreadcrumbs.map(({ icon, ...rest }) => rest)
const prevStr = JSON.stringify(prevSerializable)
const newStr = JSON.stringify(newSerializable)

// ✗ INCORRETO - Tentar serializar elementos React
const prevStr = JSON.stringify(prev) // Falha se contém elementos React
```

## Hook useBreadcrumbSetup

### Localização
`hooks/use-breadcrumb-setup.tsx`

### Responsabilidades

1. Analisa `pathname` e `searchParams` da rota atual
2. Constrói array de `BreadcrumbItem` baseado na hierarquia de rotas
3. Preserva query params (`from`, `patientId`) nos hrefs dos breadcrumbs
4. Atualiza o contexto via `setBreadcrumbs`

### Estrutura de Rotas Suportadas

```typescript
// Dashboard principal
/dashboard
  → Dashboard

// Área específica
/dashboard/[area]
  → Dashboard / [Área]

// Pacientes
/dashboard/patients
  → Dashboard / Pacientes
  → Dashboard / [Área] / Pacientes (se from presente)

/dashboard/patients/new
  → Dashboard / Pacientes / Novo
  → Dashboard / [Área] / Pacientes / Novo (se from presente)

/dashboard/patients/[id]/edit
  → Dashboard / Pacientes / Editar
  → Dashboard / [Área] / Pacientes / Editar (se from presente)

// Prontuários
/dashboard/records
  → Dashboard / Prontuários
  → Dashboard / Pacientes / Prontuários (se patientId presente)

/dashboard/records/new
  → Dashboard / Prontuários / Novo
  → Dashboard / Pacientes / Prontuários / Novo (se patientId presente)

/dashboard/records/[id]
  → Dashboard / Pacientes / Prontuários / Visualizar (sempre inclui Pacientes)

/dashboard/records/[id]/edit
  → Dashboard / Pacientes / Prontuários / Editar (sempre inclui Pacientes)
```

### Regras de Construção

1. **Sempre começar com "Dashboard"**: Primeiro item sempre é `/dashboard`
2. **Incluir área de origem**: Se `from` está presente, adicionar área antes de "Pacientes" ou "Prontuários"
3. **Incluir "Pacientes" antes de "Prontuários"**: Quando há `patientId` OU ao visualizar/editar prontuário específico
4. **Preservar query params**: Todos os hrefs devem preservar `from` e `patientId` quando relevantes

### Exemplo de Implementação

```typescript
export function useBreadcrumbSetup() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { setBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    const breadcrumbs: BreadcrumbItem[] = []
    const fromArea = searchParams.get('from') as AreaType | null
    const patientId = searchParams.get('patientId')

    // Sempre adiciona Dashboard
    breadcrumbs.push({
      label: 'Dashboard',
      href: '/dashboard',
      icon: iconMap.dashboard,
    })

    // Lógica específica por rota...
    // (ver código completo em hooks/use-breadcrumb-setup.tsx)

    setBreadcrumbs(breadcrumbs)
  }, [pathname, searchParams.toString(), setBreadcrumbs])
}
```

## Componente BreadcrumbWrapper

### Localização
`components/ui/breadcrumb-wrapper.tsx`

### Uso Obrigatório

**Todas as páginas do dashboard devem usar `<BreadcrumbWrapper />`**:

```typescript
// app/dashboard/[area]/page.tsx
import { BreadcrumbWrapper } from '@/components/ui/breadcrumb-wrapper'

export default function AreaPage() {
  return (
    <div>
      <BreadcrumbWrapper />
      {/* Conteúdo da página */}
    </div>
  )
}
```

### Por que Suspense?

O `BreadcrumbWrapper` envolve o conteúdo em `Suspense` porque:
- `useBreadcrumbSetup` usa `useSearchParams()`
- `useSearchParams()` requer Suspense boundary em Server Components
- Evita erros de renderização durante SSR

```typescript
export function BreadcrumbWrapper() {
  return (
    <Suspense fallback={<div className="mb-6 h-6" />}>
      <BreadcrumbContent />
    </Suspense>
  )
}
```

## Preservação de Query Params

### Query Params Principais

#### `from` (Área de Origem)
- **Tipo**: `AreaType` (`pilates`, `medico`, `fisioterapia`, `nutricao`, `odontologia`)
- **Uso**: Indica de qual área específica o usuário veio
- **Preservar em**: Navegação entre áreas → pacientes → prontuários

#### `patientId` (Filtro de Paciente)
- **Tipo**: `string`
- **Uso**: Filtra prontuários por paciente específico
- **Preservar em**: Navegação entre lista de prontuários → visualizar → editar

### Padrão de Construção de URLs

**Sempre usar `URLSearchParams`** para construir URLs com query params:

```typescript
// ✓ CORRETO
const queryParams = new URLSearchParams()
if (patientId) queryParams.set('patientId', patientId)
if (fromArea) queryParams.set('from', fromArea)
const href = `/dashboard/records${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

// ✗ INCORRETO - Concatenação manual propensa a erros
const href = `/dashboard/records?patientId=${patientId}&from=${fromArea}` // Pode ter undefined
```

### Exemplo Completo

```typescript
'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export function EditRecordButton({ recordId, patientId }: Props) {
  const searchParams = useSearchParams()
  
  const queryParams = new URLSearchParams()
  queryParams.set('patientId', patientId)
  const fromArea = searchParams.get('from')
  if (fromArea) queryParams.set('from', fromArea)
  
  return (
    <Link href={`/dashboard/records/${recordId}/edit?${queryParams.toString()}`}>
      <Button>Editar</Button>
    </Link>
  )
}
```

## Padrões de Links e Navegação

### Links entre Páginas Relacionadas

Ao navegar entre páginas relacionadas, **sempre preservar query params relevantes**:

```typescript
// De: /dashboard/records?patientId=1&from=pilates
// Para: /dashboard/records/1/edit
// Deve preservar: patientId=1&from=pilates

const queryParams = new URLSearchParams()
if (patientId) queryParams.set('patientId', patientId)
const fromArea = searchParams.get('from')
if (fromArea) queryParams.set('from', fromArea)

<Link href={`/dashboard/records/${recordId}/edit?${queryParams.toString()}`}>
```

### Links de Listagem

Em listagens, preservar filtros ao navegar para detalhes:

```typescript
// app/dashboard/records/page.tsx
function RecordsContent() {
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId')

  return (
    <Link href={(() => {
      const queryParams = new URLSearchParams()
      if (patientId) queryParams.set('patientId', patientId)
      const fromArea = searchParams.get('from')
      if (fromArea) queryParams.set('from', fromArea)
      return `/dashboard/records/${record.id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    })()}>
      Visualizar
    </Link>
  )
}
```

### Redirecionamentos após Ações

Após salvar/criar/atualizar, redirecionar preservando query params:

```typescript
// components/features/records/record-form.tsx
const router = useRouter()
const searchParams = useSearchParams()

// Após salvar com sucesso
setTimeout(() => {
  const queryParams = new URLSearchParams()
  const patientId = searchParams.get('patientId')
  const fromArea = searchParams.get('from')
  if (patientId) queryParams.set('patientId', patientId)
  if (fromArea) queryParams.set('from', fromArea)
  router.push(`/dashboard/records${queryParams.toString() ? `?${queryParams.toString()}` : ''}`)
}, 1500)
```

## Estrutura de Rotas

### Hierarquia Padrão

```
Dashboard
  ├── [Área] (pilates, medico, etc)
  │   └── Pacientes (com from)
  │       ├── Novo (com from)
  │       └── [id]/edit (com from)
  ├── Pacientes
  │   ├── Novo
  │   └── [id]/edit
  └── Prontuários
      ├── Novo (com patientId se presente)
      ├── [id] (sempre inclui Pacientes no breadcrumb)
      └── [id]/edit (sempre inclui Pacientes no breadcrumb)
```

### Regras de Breadcrumb por Rota

| Rota | Breadcrumb Esperado |
|------|---------------------|
| `/dashboard` | Dashboard |
| `/dashboard/pilates` | Dashboard / Pilates |
| `/dashboard/patients` | Dashboard / Pacientes |
| `/dashboard/patients?from=pilates` | Dashboard / Pilates / Pacientes |
| `/dashboard/patients/new?from=pilates` | Dashboard / Pilates / Pacientes / Novo |
| `/dashboard/records` | Dashboard / Prontuários |
| `/dashboard/records?patientId=1` | Dashboard / Pacientes / Prontuários |
| `/dashboard/records/1` | Dashboard / Pacientes / Prontuários / Visualizar |
| `/dashboard/records/1/edit?patientId=1` | Dashboard / Pacientes / Prontuários / Editar |

## Suspense e Client Components

### Quando Usar Suspense

**Componentes que usam `useSearchParams()` DEVEM estar em Suspense boundary**:

```typescript
// ✓ CORRETO - Server Component com Suspense
import { Suspense } from 'react'
import { RecordForm } from '@/components/features/records/record-form'

export default function NewRecordPage() {
  return (
    <div>
      <Suspense fallback={<div>Carregando...</div>}>
        <RecordForm />
      </Suspense>
    </div>
  )
}

// ✗ INCORRETO - RecordForm usa useSearchParams sem Suspense
export default function NewRecordPage() {
  return <RecordForm /> // Erro: useSearchParams() should be wrapped in suspense
}
```

### Componentes que Requerem Suspense

- `RecordForm` (usa `useSearchParams` para preservar query params)
- `EditRecordButton` (usa `useSearchParams` para ler `from`)
- Qualquer componente Client que use `useSearchParams()`

### Padrão de Wrapper

Para componentes reutilizáveis que usam `useSearchParams`, criar wrapper com Suspense:

```typescript
// components/features/records/edit-record-button-wrapper.tsx
import { Suspense } from 'react'
import { EditRecordButton } from './edit-record-button'

export function EditRecordButtonWrapper(props: Props) {
  return (
    <Suspense fallback={<Button disabled>Editar</Button>}>
      <EditRecordButton {...props} />
    </Suspense>
  )
}
```

## Exemplos Práticos

### Exemplo 1: Página de Área com Link para Pacientes

```typescript
// app/dashboard/[area]/page.tsx
export default async function AreaPage({ params }: AreaPageProps) {
  const { area } = await params

  return (
    <div>
      <BreadcrumbWrapper />
      
      <Link href={`/dashboard/patients?from=${area}`}>
        <Button>Paciente</Button>
      </Link>
    </div>
  )
}
```

### Exemplo 2: Lista de Prontuários com Filtro

```typescript
// app/dashboard/records/page.tsx
'use client'

function RecordsContent() {
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId')
  const fromArea = searchParams.get('from')

  return (
    <>
      <BreadcrumbWrapper />
      
      {patientId && (
        <span>Filtrado: {patientName}</span>
      )}
      
      <Link href={(() => {
        const queryParams = new URLSearchParams()
        if (patientId) queryParams.set('patientId', patientId)
        if (fromArea) queryParams.set('from', fromArea)
        return `/dashboard/records/new${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      })()}>
        Novo Prontuário
      </Link>
    </>
  )
}
```

### Exemplo 3: Formulário que Preserva Contexto

```typescript
// components/features/records/record-form.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function RecordForm({ initialData, recordId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = async (data: FormData) => {
    // ... salvar dados
    
    // Redirecionar preservando query params
    const queryParams = new URLSearchParams()
    const patientId = searchParams.get('patientId')
    const fromArea = searchParams.get('from')
    if (patientId) queryParams.set('patientId', patientId)
    if (fromArea) queryParams.set('from', fromArea)
    
    router.push(`/dashboard/records${queryParams.toString() ? `?${queryParams.toString()}` : ''}`)
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### Exemplo 4: Botão de Edição com Contexto

```typescript
// components/features/records/edit-record-button.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export function EditRecordButton({ recordId, patientId }: Props) {
  const searchParams = useSearchParams()
  
  const queryParams = new URLSearchParams()
  queryParams.set('patientId', patientId)
  const fromArea = searchParams.get('from')
  if (fromArea) queryParams.set('from', fromArea)
  
  return (
    <Link href={`/dashboard/records/${recordId}/edit?${queryParams.toString()}`}>
      <Button>Editar</Button>
    </Link>
  )
}

// Uso em Server Component com Suspense
import { Suspense } from 'react'

export default function ViewRecordPage() {
  return (
    <div>
      <Suspense fallback={<Button disabled>Editar</Button>}>
        <EditRecordButton recordId="1" patientId="1" />
      </Suspense>
    </div>
  )
}
```

## Checklist de Implementação

Ao criar ou modificar páginas de navegação, verificar:

### Breadcrumbs
- [ ] Página usa `<BreadcrumbWrapper />` no topo
- [ ] Breadcrumb reflete corretamente a hierarquia de rotas
- [ ] Breadcrumb inclui área de origem quando `from` está presente
- [ ] Breadcrumb inclui "Pacientes" antes de "Prontuários" quando apropriado

### Query Params
- [ ] Links preservam `from` quando navegando de área específica
- [ ] Links preservam `patientId` quando navegando entre prontuários
- [ ] URLs são construídas com `URLSearchParams` (não concatenação manual)
- [ ] Redirecionamentos após ações preservam query params relevantes

### Suspense Boundaries
- [ ] Componentes que usam `useSearchParams()` estão em Suspense
- [ ] Fallbacks apropriados são fornecidos para Suspense
- [ ] Server Components que importam Client Components com `useSearchParams` envolvem em Suspense

### Links e Navegação
- [ ] Links entre páginas relacionadas preservam contexto
- [ ] Links de listagem preservam filtros ao navegar para detalhes
- [ ] Botões de ação (editar, visualizar) preservam query params

### TypeScript
- [ ] Props de componentes estão tipadas corretamente
- [ ] Query params são validados/tipados quando necessário
- [ ] `AreaType` é usado para tipar parâmetro `from`

## Erros Comuns e Soluções

### Erro: "useSearchParams() should be wrapped in a suspense boundary"

**Causa**: Componente Client que usa `useSearchParams()` não está em Suspense

**Solução**: Envolver componente em `<Suspense>`:

```typescript
<Suspense fallback={<div>Carregando...</div>}>
  <ComponenteQueUsaSearchParams />
</Suspense>
```

### Erro: "Maximum update depth exceeded"

**Causa**: `setBreadcrumbs` sendo chamado infinitamente no `useEffect`

**Solução**: Usar `searchParams.toString()` no array de dependências e comparar dados serializáveis:

```typescript
useEffect(() => {
  // ... construir breadcrumbs
  setBreadcrumbs(breadcrumbs)
}, [pathname, searchParams.toString(), setBreadcrumbs]) // ✓ searchParams.toString()
```

### Breadcrumb não mostra área de origem

**Causa**: Query param `from` não está sendo preservado nos links

**Solução**: Verificar se links estão construindo URLs com `URLSearchParams`:

```typescript
const queryParams = new URLSearchParams()
if (fromArea) queryParams.set('from', fromArea)
const href = `/dashboard/patients?${queryParams.toString()}`
```

### Breadcrumb duplicado após refresh

**Causa**: Tentativa de salvar breadcrumbs no sessionStorage com elementos React

**Solução**: Não usar sessionStorage. Breadcrumbs são reconstruídos dinamicamente pelo hook.
