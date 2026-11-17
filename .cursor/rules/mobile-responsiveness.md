# Padrões de Responsividade Mobile

**Tipo:** Always Apply  
**Descrição:** Padrões obrigatórios para responsividade mobile em todo o projeto

## Princípio Mobile-First

**Sempre desenvolver mobile-first:** Começar com estilos para mobile e depois adaptar para desktop usando breakpoints do Tailwind (`sm:`, `md:`, `lg:`, `xl:`).

## Tamanhos de Fonte

### Tabelas e Listagens

**Padrão obrigatório:**
- **Cabeçalhos de tabela:** `text-sm sm:text-xs` (maior no mobile para legibilidade)
- **Células de tabela:** `text-base sm:text-sm` (maior no mobile)
- **Textos secundários:** `text-sm sm:text-sm` ou `text-xs sm:text-sm`
- **Mensagens e labels:** `text-sm sm:text-sm` ou `text-base sm:text-sm`

```typescript
// ✓ CORRETO
<th className="px-3 sm:px-6 py-3 text-left text-sm sm:text-xs font-medium text-gray-500">
  Nome
</th>
<td className="px-3 sm:px-6 py-3 sm:py-4 text-base sm:text-sm text-gray-900">
  {content}
</td>

// ✗ INCORRETO - Fonte muito pequena no mobile
<th className="text-xs">Nome</th>
<td className="text-xs">{content}</td>
```

### Cards e Componentes Gerais

- **Títulos:** `text-base sm:text-lg` ou `text-lg sm:text-xl`
- **Textos:** `text-sm sm:text-base` ou `text-base sm:text-base`
- **Labels e descrições:** `text-sm sm:text-sm`

## Botões de Ação em Tabelas/Listagens

**Padrão obrigatório para botões de ação:**

```typescript
// ✓ CORRETO - Botões de ação em tabelas/listagens
<Button
  variant="ghost"
  size="sm"
  className="flex items-center justify-center gap-1 sm:gap-1.5 p-2 sm:p-2 h-10 w-10 sm:h-auto sm:w-auto"
  aria-label="Ação"
>
  <svg className="h-5 w-5 sm:h-4 sm:w-4" />
  <span className="hidden sm:inline">Texto</span>
</Button>
```

**Especificações:**
- **Mobile:** `h-10 w-10` (40px) - tamanho mínimo recomendado para toque
- **Desktop:** `h-auto w-auto` (tamanho padrão do componente)
- **Ícones:** `h-5 w-5` no mobile, `h-4 w-4` no desktop
- **Textos:** Sempre ocultar no mobile (`hidden sm:inline`) quando o botão tem apenas ícone
- **Padding:** `p-2` em ambos os tamanhos
- **Justify-center:** Sempre usar `justify-center` para centralizar ícones no mobile

## Espaçamentos

**Padrões de padding e margin:**

- **Cards:** `p-4 sm:p-6` (menor no mobile)
- **Gap entre elementos:** `gap-1 sm:gap-2` ou `gap-2 sm:gap-3`
- **Margin bottom:** `mb-3 sm:mb-4` ou `mb-4 sm:mb-6`
- **Padding horizontal:** `px-4 sm:px-6 lg:px-8`

## Cards Clicáveis em Mobile

Para cards que devem ser clicáveis no mobile:

```typescript
// ✓ CORRETO
<Card className="p-4 sm:p-6 relative hover:shadow-md transition-shadow">
  <Link 
    href={viewUrl}
    className="absolute inset-0 sm:static sm:contents"
    aria-label={`Visualizar: ${title}`}
  />
  <div className="flex items-start justify-between relative z-10">
    {/* Conteúdo */}
    <div className="flex-1 min-w-0">
      {/* ... */}
    </div>
    {/* Botões com z-index maior */}
    <div className="flex items-center gap-1 sm:gap-2 relative z-20">
      {/* Botões de ação */}
    </div>
  </div>
</Card>
```

**Padrões:**
- Link invisível cobre todo o card no mobile (`absolute inset-0`)
- No desktop, Link usa `sm:static sm:contents` para não interferir
- Botões de ação devem ter `z-index` maior que o conteúdo (`z-20` ou `z-30`)
- Usar `stopPropagation` nos botões para evitar navegação ao clicar neles

## Tabelas Responsivas

**Estrutura obrigatória:**

```typescript
// ✓ CORRETO
<div className="overflow-x-auto -mx-4 sm:mx-0">
  <div className="inline-block min-w-full align-middle sm:px-0 px-4">
    <table className="w-full">
      <thead>
        <tr>
          <th className="px-3 sm:px-6 py-3 text-left text-sm sm:text-xs">
            Coluna
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="px-3 sm:px-6 py-3 sm:py-4 text-base sm:text-sm">
            Conteúdo
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

**Padrões:**
- Container com `overflow-x-auto` para scroll horizontal no mobile
- Padding negativo (`-mx-4`) no mobile para compensar padding do container pai
- Padding nas células: `px-3 sm:px-6` e `py-3 sm:py-4`

## Tabela de Referência Rápida

| Elemento | Mobile | Desktop |
|----------|--------|---------|
| **Botões ação (tabelas)** | `h-10 w-10` | `h-auto w-auto` |
| **Ícones em botões ação** | `h-5 w-5` | `h-4 w-4` |
| **Texto tabela (células)** | `text-base` | `text-sm` |
| **Cabeçalho tabela** | `text-sm` | `text-xs` |
| **Padding cards** | `p-4` | `p-6` |
| **Gap elementos** | `gap-1` ou `gap-2` | `gap-2` ou `gap-3` |
| **Padding horizontal** | `px-4` | `px-6 lg:px-8` |
| **Margin bottom** | `mb-3` ou `mb-4` | `mb-4` ou `mb-6` |

## Checklist de Responsividade

- [ ] Fontes maiores no mobile (`text-base` em tabelas, `text-sm` em cabeçalhos)
- [ ] Botões de ação: `h-10 w-10` no mobile
- [ ] Ícones em botões: `h-5 w-5` no mobile
- [ ] Textos de botões ocultos no mobile quando apropriado
- [ ] Padding reduzido no mobile (`p-4` vs `p-6`)
- [ ] Gap reduzido no mobile (`gap-1` vs `gap-2`)
- [ ] Tabelas com scroll horizontal no mobile
- [ ] Cards clicáveis implementados corretamente no mobile
- [ ] Breakpoints usados corretamente (`sm:`, `md:`, `lg:`, `xl:`)
