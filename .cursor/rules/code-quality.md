# Verificações de Qualidade de Código

**Tipo:** Always Apply  
**Descrição:** Regras para verificação automática de variáveis não utilizadas, possíveis valores `undefined`, e outros problemas de qualidade de código durante a edição (sem executar build)

## Regras Obrigatórias

### 1. Variáveis e Imports Não Utilizados

**SEMPRE verificar antes de criar/editar código:**

- ✅ Remover imports não utilizados
- ✅ Remover variáveis declaradas mas nunca usadas
- ✅ Remover funções/interfaces/types não utilizados
- ✅ Remover parâmetros de função não utilizados (ou prefixar com `_`)

```typescript
// ❌ INCORRETO - Import não utilizado
import { useState, useEffect, useMemo } from 'react'
// useMemo não é usado

// ✅ CORRETO
import { useState, useEffect } from 'react'

// ❌ INCORRETO - Variável não utilizada
const calculateTotal = (items: Item[]) => {
  const tax = 0.1 // Não usado
  return items.reduce((sum, item) => sum + item.price, 0)
}

// ✅ CORRETO - Remover ou usar
const calculateTotal = (items: Item[]) => {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// ❌ INCORRETO - Parâmetro não utilizado
function handleClick(event: MouseEvent, unusedParam: string) {
  console.log('clicked')
}

// ✅ CORRETO - Prefixar com _ se necessário para interface
function handleClick(event: MouseEvent, _unusedParam: string) {
  console.log('clicked')
}
```

### 2. Verificação de Possíveis `undefined`

**SEMPRE verificar acesso a valores que podem ser `undefined`:**

- ✅ Usar optional chaining (`?.`) quando apropriado
- ✅ Verificar `undefined` antes de usar como índice de objeto
- ✅ Verificar `undefined` antes de acessar propriedades de array
- ✅ Usar nullish coalescing (`??`) para valores padrão
- ✅ Verificar retorno de funções que podem retornar `undefined`

```typescript
// ❌ INCORRETO - Pode ser undefined
const firstItem = items[0].name // items[0] pode ser undefined

// ✅ CORRETO - Verificar antes
const firstItem = items[0]?.name ?? ''

// ❌ INCORRETO - Pode ser undefined como índice
const dateKey = date.toISOString().split('T')[0]
if (prev[dateKey]) { // dateKey pode ser undefined

// ✅ CORRETO - Verificar antes de usar
const dateKey = date.toISOString().split('T')[0]
if (!dateKey) return
if (prev[dateKey]) {

// ❌ INCORRETO - Propriedade pode ser undefined
const capacity = professionals[0].maxCapacity

// ✅ CORRETO - Optional chaining
const capacity = professionals[0]?.maxCapacity ?? 4

// ❌ INCORRETO - Função pode retornar undefined
const result = someFunction()
const value = result.property

// ✅ CORRETO - Verificar retorno
const result = someFunction()
if (!result) return
const value = result.property

// ❌ INCORRETO - Prop opcional sem verificação
function Component({ error }: { error?: string }) {
  return <div>{error.toUpperCase()}</div> // error pode ser undefined
}

// ✅ CORRETO - Verificar ou usar spread condicional
function Component({ error }: { error?: string }) {
  return <div>{error?.toUpperCase()}</div>
}

// ✅ CORRETO - Para props de componente
<Input {...(fieldErrors.name && { error: fieldErrors.name })} />
```

### 3. Verificação de Tipos em Props de Componentes

**SEMPRE verificar compatibilidade de tipos:**

- ✅ Props opcionais não devem ser passadas como `undefined` explicitamente
- ✅ Usar spread condicional para props opcionais
- ✅ Verificar tipos de props que podem ser `string | undefined`

```typescript
// ❌ INCORRETO - Passando undefined explicitamente
<Input error={fieldErrors.name} /> // error pode ser undefined

// ✅ CORRETO - Spread condicional
<Input {...(fieldErrors.name && { error: fieldErrors.name })} />

// ❌ INCORRETO - Tipo incompatível
interface InputProps {
  error?: string // Não aceita undefined explicitamente com exactOptionalPropertyTypes
}

// ✅ CORRETO - Spread condicional ou verificação
{fieldErrors.name && <Input error={fieldErrors.name} />}
// OU
<Input {...(fieldErrors.name ? { error: fieldErrors.name } : {})} />
```

### 4. Verificação de Acesso a Arrays e Objetos

**SEMPRE verificar antes de acessar:**

- ✅ Verificar se array não está vazio antes de acessar índice
- ✅ Verificar se objeto existe antes de acessar propriedade
- ✅ Usar optional chaining para propriedades aninhadas

```typescript
// ❌ INCORRETO - Array pode estar vazio
const first = items[0] // items pode estar vazio

// ✅ CORRETO - Verificar comprimento
if (items.length > 0) {
  const first = items[0]
}
// OU
const first = items[0]?.name

// ❌ INCORRETO - Objeto pode não existir
const user = users.find(u => u.id === id)
const name = user.name // user pode ser undefined

// ✅ CORRETO - Verificar resultado
const user = users.find(u => u.id === id)
if (!user) return null
const name = user.name
```

### 5. Verificação de Strings e Valores Primitivos

**SEMPRE verificar valores que podem ser `undefined`:**

- ✅ Verificar resultado de `split()`, `match()`, etc. antes de usar índice
- ✅ Verificar retorno de funções que podem retornar `undefined`

```typescript
// ❌ INCORRETO - split()[0] pode ser undefined
const dateKey: string = date.toISOString().split('T')[0]

// ✅ CORRETO - Verificar ou usar fallback
const dateKey = date.toISOString().split('T')[0] || ''
if (!dateKey) return

// ❌ INCORRETO - match pode retornar null
const match = str.match(/pattern/)
const value = match[1] // match pode ser null

// ✅ CORRETO - Verificar match
const match = str.match(/pattern/)
if (!match) return
const value = match[1]
```

## Checklist Antes de Finalizar Código

Ao criar ou editar qualquer arquivo, **SEMPRE verificar**:

- [ ] Todos os imports estão sendo utilizados?
- [ ] Todas as variáveis declaradas estão sendo utilizadas?
- [ ] Todas as funções/interfaces/types estão sendo utilizadas?
- [ ] Todos os acessos a arrays verificam se o índice existe?
- [ ] Todos os acessos a objetos verificam se a propriedade existe?
- [ ] Todas as props opcionais são tratadas corretamente (não passadas como `undefined`)?
- [ ] Todos os resultados de funções que podem retornar `undefined` são verificados?
- [ ] Todos os resultados de `split()`, `match()`, etc. são verificados antes de usar índice?
- [ ] Optional chaining (`?.`) é usado onde apropriado?
- [ ] Nullish coalescing (`??`) é usado para valores padrão?

## Exemplos de Verificações Automáticas

### Ao Criar/Editar Componente

```typescript
// ✅ VERIFICAR: Todos os imports são usados?
import { useState, useEffect, useMemo } from 'react' // useMemo não usado? REMOVER

// ✅ VERIFICAR: Props opcionais são tratadas corretamente?
interface Props {
  error?: string
}
function Component({ error }: Props) {
  // ✅ VERIFICAR: error pode ser undefined?
  return <div>{error?.toUpperCase()}</div> // ✅ CORRETO
  // return <div>{error.toUpperCase()}</div> // ❌ INCORRETO
}

// ✅ VERIFICAR: Acesso a arrays é seguro?
const items = [1, 2, 3]
const first = items[0]?.toString() ?? '' // ✅ CORRETO
// const first = items[0].toString() // ❌ INCORRETO se items pode estar vazio
```

### Ao Criar/Editar Função

```typescript
// ✅ VERIFICAR: Parâmetros não utilizados?
function handler(event: Event, _unused: string) { // ✅ Prefixar com _
  // ...
}

// ✅ VERIFICAR: Retorno pode ser undefined?
function findUser(id: string): User | undefined {
  return users.find(u => u.id === id)
}

// ✅ VERIFICAR: Chamador trata undefined?
const user = findUser('123')
if (!user) return // ✅ CORRETO
const name = user.name
```

### Ao Criar/Editar Hook ou Effect

```typescript
// ✅ VERIFICAR: Todas as dependências são usadas?
useEffect(() => {
  // dependency1 usado? ✅
  // dependency2 usado? ❌ REMOVER da array de dependências
}, [dependency1]) // ✅ CORRETO

// ✅ VERIFICAR: Estado pode ser undefined?
const [data, setData] = useState<string | undefined>(undefined)
const length = data?.length ?? 0 // ✅ CORRETO
```

## Regras Específicas para TypeScript Strict Mode

Com `exactOptionalPropertyTypes: true`:

- ❌ **NUNCA** passar `undefined` explicitamente para props opcionais
- ✅ **SEMPRE** usar spread condicional: `{...(value && { prop: value })}`
- ✅ **SEMPRE** verificar antes de passar: `{value ? <Component prop={value} /> : <Component />}`

```typescript
// ❌ INCORRETO com exactOptionalPropertyTypes
<Input error={fieldErrors.name} /> // error pode ser undefined

// ✅ CORRETO
<Input {...(fieldErrors.name && { error: fieldErrors.name })} />
```

## Aplicação Automática

Estas verificações devem ser aplicadas **automaticamente** durante:

1. **Criação de novo código** - Verificar antes de finalizar
2. **Edição de código existente** - Verificar após cada mudança significativa
3. **Refatoração** - Verificar após mover/renomear código
4. **Correção de erros** - Verificar se a correção não introduziu novos problemas

## Prioridade

- 🔴 **CRÍTICO**: Variáveis não utilizadas que causam erro no build
- 🟡 **ALTO**: Possíveis `undefined` que podem causar runtime errors
- 🟢 **MÉDIO**: Imports não utilizados (afeta bundle size)
- 🔵 **BAIXO**: Código morto (não afeta funcionalidade, mas polui código)

## Notas

- Estas verificações devem ser feitas **durante a edição**, não apenas no build
- O objetivo é prevenir erros antes que cheguem ao build
- Sempre preferir prevenção (verificação) a correção (após erro)
- Quando em dúvida, ser conservador e adicionar verificações extras
