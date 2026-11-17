# Validação de Formulários com Zod

**Tipo:** Always Apply  
**Aplica-se a:** Todos os formulários do projeto  
**Descrição:** Padrão obrigatório para validação de formulários usando Zod, seguindo o mesmo padrão da tela "Editar Paciente"

## Princípios Fundamentais

1. ✅ **SEMPRE** usar Zod para validação de formulários
2. ✅ **SEMPRE** usar `safeParse()` para validação client-side
3. ✅ **SEMPRE** mapear erros usando `issue.path.join('.')`
4. ✅ **SEMPRE** usar `fieldErrors` state para exibir erros nos campos
5. ✅ **NUNCA** usar validação HTML5 (`required`, `pattern`, etc.)
6. ✅ **NUNCA** usar validação manual com `if/else` quando há schema Zod disponível

## Estrutura de Schema Zod

### Schema Básico

```typescript
// lib/validations/[entity].ts
import { z } from 'zod'

export const entitySchema = z.object({
  // Campos obrigatórios
  campoObrigatorio: z.string().min(1, 'Campo é obrigatório'),
  
  // Campos com validação específica
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().min(10, 'Telefone inválido').max(15, 'Telefone muito longo'),
  
  // Campos opcionais
  campoOpcional: z.string().max(100, 'Campo muito longo').optional().or(z.literal('')),
  
  // Enums
  tipo: z.enum(['tipo1', 'tipo2'], {
    errorMap: () => ({ message: 'Selecione uma opção válida' }),
  }),
})

export type EntityInput = z.infer<typeof entitySchema>
```

### Schema com Validações Condicionais (superRefine)

**Use `superRefine()` quando precisar de validações condicionais baseadas em outros campos:**

```typescript
export const appointmentSchema = z.object({
  tipo: z.enum(['tipo1', 'tipo2']),
  campo1: z.string().optional(),
  campo2: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validações condicionais por tipo
  if (data.tipo === 'tipo1') {
    if (!data.campo1?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['campo1'],
        message: 'Campo1 é obrigatório para tipo1',
      })
    }
  } else if (data.tipo === 'tipo2') {
    if (!data.campo2?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['campo2'],
        message: 'Campo2 é obrigatório para tipo2',
      })
    }
    // Validação adicional (ex: email)
    if (data.campo2 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.campo2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['campo2'],
        message: 'Email inválido',
      })
    }
  }
})
```

### Validação de Email

```typescript
// ✅ CORRETO - Usar validação Zod ou regex
email: z.string().email('Email inválido').optional().or(z.literal(''))

// OU em superRefine:
if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: ['email'],
    message: 'Email inválido',
  })
}
```

## Implementação no Componente

### 1. Estado e Imports

```typescript
'use client'

import { useState } from 'react'
import { entitySchema, type EntityInput } from '@/lib/validations/[entity]'

export function EntityForm() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  // ... outros estados
}
```

### 2. Função handleSubmit

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)
  setFieldErrors({})

  // Preparar dados para validação (remover máscaras, normalizar, etc.)
  const dataToValidate = {
    campo1: formData.campo1,
    campo2: formData.campo2 ? removeMask(formData.campo2) : '',
    // ... outros campos
  }

  // Validação usando Zod schema
  const result = entitySchema.safeParse(dataToValidate)
  if (!result.success) {
    const errors: Partial<Record<string, string>> = {}
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.')
      errors[path] = issue.message
    })
    setFieldErrors(errors)
    setError('Por favor, corrija os erros acima')
    return
  }

  // Se validação passou, continuar com submit
  try {
    // ... lógica de submit
  } catch (err) {
    setError('Erro ao processar formulário')
  }
}
```

### 3. Exibição de Erros nos Campos

```typescript
<Input
  label="Nome"
  value={formData.nome}
  onChange={(e) => {
    setFormData(prev => ({ ...prev, nome: e.target.value }))
    // Limpar erro ao digitar
    if (fieldErrors.nome) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.nome
        return newErrors
      })
    }
  }}
  {...(fieldErrors.nome && { error: fieldErrors.nome })}
  placeholder="Digite o nome"
/>
```

**IMPORTANTE:** Use spread condicional para props opcionais:
```typescript
// ✅ CORRETO
{...(fieldErrors.nome && { error: fieldErrors.nome })}

// ❌ INCORRETO (causa erro com exactOptionalPropertyTypes)
error={fieldErrors.nome}
```

### 4. Limpeza de Erros ao Modificar Campos

```typescript
onChange={(e) => {
  setFormData(prev => ({ ...prev, campo: e.target.value }))
  
  // Limpar erro ao digitar
  if (fieldErrors.campo) {
    setFieldErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.campo
      return newErrors
    })
  }
}}
```

## Padrões de Mensagens de Erro

### Mensagens Padronizadas

```typescript
// Campos obrigatórios
z.string().min(1, 'Campo é obrigatório')
z.string().min(2, 'Campo deve ter no mínimo 2 caracteres')

// Campos com tamanho máximo
z.string().max(100, 'Campo muito longo')

// Validações específicas
z.string().email('Email inválido')
z.string().min(10, 'Telefone inválido')
z.string().length(11, 'CPF deve conter 11 dígitos')

// Enums
z.enum(['opcao1', 'opcao2'], {
  errorMap: () => ({ message: 'Selecione uma opção válida' }),
})

// Arrays
z.array(z.number()).min(1, 'Selecione pelo menos uma opção')

// Datas
z.date({
  required_error: 'Selecione uma data',
})
```

### Mensagens em superRefine

```typescript
ctx.addIssue({
  code: z.ZodIssueCode.custom,
  path: ['campo'],
  message: 'Mensagem específica e clara para o usuário',
})
```

## Exemplos Completos

### Exemplo 1: Formulário Simples

```typescript
// lib/validations/user.ts
import { z } from 'zod'

export const userSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone inválido').max(15, 'Telefone muito longo'),
})

export type UserInput = z.infer<typeof userSchema>

// components/features/user/user-form.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setFieldErrors({})

  const result = userSchema.safeParse(formData)
  if (!result.success) {
    const errors: Partial<Record<string, string>> = {}
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.')
      errors[path] = issue.message
    })
    setFieldErrors(errors)
    return
  }

  // Submit...
}
```

### Exemplo 2: Formulário com Validações Condicionais

```typescript
// lib/validations/appointment.ts
export const appointmentSchema = z.object({
  tipo: z.enum(['fixo', 'movel']),
  pacienteId: z.string().optional(),
  pacienteNome: z.string().optional(),
  pacienteTelefone: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.tipo === 'fixo') {
    if (!data.pacienteId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pacienteId'],
        message: 'Selecione um paciente',
      })
    }
  } else if (data.tipo === 'movel') {
    if (!data.pacienteNome?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pacienteNome'],
        message: 'Informe o nome do paciente',
      })
    }
    if (!data.pacienteTelefone?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pacienteTelefone'],
        message: 'Informe o telefone do paciente',
      })
    }
  }
})
```

## Checklist de Validação

Ao criar ou editar um formulário, **SEMPRE verificar**:

- [ ] Schema Zod criado em `lib/validations/[entity].ts`?
- [ ] Schema exporta type usando `z.infer<typeof schema>`?
- [ ] Validação usa `safeParse()` no `handleSubmit`?
- [ ] Erros são mapeados usando `issue.path.join('.')`?
- [ ] `fieldErrors` state é usado para exibir erros?
- [ ] Erros são limpos ao modificar campos?
- [ ] Props de erro usam spread condicional `{...(fieldErrors.campo && { error: fieldErrors.campo })}`?
- [ ] Mensagens de erro são claras e específicas?
- [ ] Validações condicionais usam `superRefine()` quando necessário?
- [ ] Não há atributos HTML5 `required`, `pattern`, etc.?
- [ ] Não há validação manual com `if/else` quando há schema Zod?

## Regras Específicas

### ❌ NUNCA Faça

```typescript
// ❌ Validação HTML5
<input required pattern="..." />

// ❌ Validação manual quando há schema
if (!nome) {
  errors.nome = 'Nome é obrigatório'
}

// ❌ Passar undefined explicitamente para props opcionais
<Input error={fieldErrors.nome} /> // nome pode ser undefined

// ❌ Usar refine() para validações condicionais complexas
// Use superRefine() para mensagens específicas por campo
```

### ✅ SEMPRE Faça

```typescript
// ✅ Usar Zod schema
const result = schema.safeParse(data)

// ✅ Mapear erros corretamente
result.error.issues.forEach((issue) => {
  const path = issue.path.join('.')
  errors[path] = issue.message
})

// ✅ Spread condicional para props opcionais
{...(fieldErrors.campo && { error: fieldErrors.campo })}

// ✅ Limpar erros ao modificar campos
if (fieldErrors.campo) {
  setFieldErrors(prev => {
    const newErrors = { ...prev }
    delete newErrors.campo
    return newErrors
  })
}
```

## Referências

- **Exemplo de referência:** `components/features/patient/patient-form.tsx`
- **Schemas de referência:** `lib/validations/patient.ts`, `lib/validations/appointment.ts`
- **Documentação Zod:** https://zod.dev/

## Notas Importantes

1. **Consistência:** Todos os formulários devem seguir este padrão exato
2. **Type Safety:** Sempre usar `z.infer<typeof schema>` para tipos
3. **Mensagens:** Mensagens devem ser claras e orientadas ao usuário
4. **Performance:** Validação client-side com Zod é rápida e eficiente
5. **Manutenibilidade:** Schemas centralizados facilitam manutenção e testes
