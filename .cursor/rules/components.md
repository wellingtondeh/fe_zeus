# PadrÃµes de Componentes React

**Tipo:** Auto Attached  
**Aplica-se a:** `components/**/*.tsx`, `components/**/*.ts`  
**DescriÃ§Ã£o:** PadrÃµes para criaÃ§Ã£o de componentes - estrutura, props, acessibilidade e boas prÃ¡ticas

## Estrutura Base de Componente

```typescript
// components/ui/button.tsx

// 1. Imports (externos â†’ internos â†’ tipos)
import { type ComponentProps, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// 2. Variantes (se usar CVA)
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        ghost: 'hover:bg-gray-100',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-11 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

// 3. Interface de Props
interface ButtonProps
  extends ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

// 4. Componente
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner className="mr-2 h-4 w-4 animate-spin" />
            Carregando...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

## Tipagem de Props

### Estender Props Nativas

```typescript
import { type ComponentProps } from 'react'

// âœ… CORRETO - Herda todas as props nativas
interface InputProps extends ComponentProps<'input'> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div>
      {label && <label>{label}</label>}
      <input
        className={cn('border rounded px-3 py-2', className)}
        aria-invalid={!!error}
        aria-describedby={error ? 'error-message' : undefined}
        {...props}
      />
      {error && <span id="error-message" className="text-red-600">{error}</span>}
    </div>
  )
}

// âŒ INCORRETO - Props incompletas
interface InputProps {
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  // Faltam type, placeholder, disabled, etc.
}
```

### Props com Children

```typescript
import { type ReactNode } from 'react'

interface CardProps {
  title: string
  children: ReactNode
  footer?: ReactNode
}

export function Card({ title, children, footer }: CardProps) {
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div>{children}</div>
      {footer && <div className="mt-4 border-t pt-4">{footer}</div>}
    </div>
  )
}
```

## ComposiÃ§Ã£o de Componentes

### Pattern: Compound Components

```typescript
// components/ui/card.tsx

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-lg border bg-white shadow-sm', className)}>
      {children}
    </div>
  )
}

function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)}>
      {children}
    </div>
  )
}

function CardTitle({ children, className }: CardProps) {
  return (
    <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)}>
      {children}
    </h3>
  )
}

function CardContent({ children, className }: CardProps) {
  return <div className={cn('p-6 pt-0', className)}>{children}</div>
}

function CardFooter({ children, className }: CardProps) {
  return (
    <div className={cn('flex items-center p-6 pt-0', className)}>
      {children}
    </div>
  )
}

// Exportar como namespace
Card.Header = CardHeader
Card.Title = CardTitle
Card.Content = CardContent
Card.Footer = CardFooter

// Uso:
export function ProductCard() {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Produto</Card.Title>
      </Card.Header>
      <Card.Content>
        <p>DescriÃ§Ã£o do produto</p>
      </Card.Content>
      <Card.Footer>
        <Button>Comprar</Button>
      </Card.Footer>
    </Card>
  )
}
```

## Acessibilidade (A11y)

### HTML SemÃ¢ntico

```typescript
// âœ… CORRETO - HTML semÃ¢ntico
export function Article({ title, content }: ArticleProps) {
  return (
    <article>
      <header>
        <h1>{title}</h1>
      </header>
      <section>
        <p>{content}</p>
      </section>
    </article>
  )
}

// âŒ INCORRETO - Divs genÃ©ricas
export function Article({ title, content }: ArticleProps) {
  return (
    <div>
      <div>
        <div>{title}</div>
      </div>
      <div>
        <div>{content}</div>
      </div>
    </div>
  )
}
```

### ARIA Labels e Roles

```typescript
export function SearchButton() {
  return (
    <button
      aria-label="Buscar produtos"
      onClick={handleSearch}
    >
      <SearchIcon />
    </button>
  )
}

export function Navigation() {
  return (
    <nav aria-label="NavegaÃ§Ã£o principal">
      <ul role="list">
        <li><a href="/home">InÃ­cio</a></li>
        <li><a href="/products">Produtos</a></li>
      </ul>
    </nav>
  )
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      hidden={!isOpen}
    >
      <h2 id="modal-title">TÃ­tulo do Modal</h2>
      {children}
      <button onClick={onClose} aria-label="Fechar modal">Ã—</button>
    </div>
  )
}
```

### NavegaÃ§Ã£o por Teclado

```typescript
'use client'

export function Dropdown({ items }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(0)

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        setIsOpen(false)
        break
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex((prev) => (prev + 1) % items.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex((prev) => (prev - 1 + items.length) % items.length)
        break
      case 'Enter':
        e.preventDefault()
        items[focusedIndex].onClick()
        break
    }
  }

  return (
    <div onKeyDown={handleKeyDown}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen(!isOpen)}
      >
        Menu
      </button>
      {isOpen && (
        <ul role="menu">
          {items.map((item, index) => (
            <li
              key={item.id}
              role="menuitem"
              tabIndex={focusedIndex === index ? 0 : -1}
              onClick={item.onClick}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### Contraste e Legibilidade

```typescript
// âœ… CORRETO - Contraste adequado (WCAG AA)
<button className="bg-blue-600 text-white"> {/* 4.5:1 */}
  Clique aqui
</button>

// âŒ INCORRETO - Contraste insuficiente
<button className="bg-gray-300 text-gray-400"> {/* < 3:1 */}
  Clique aqui
</button>

// âœ… CORRETO - Texto legÃ­vel
<p className="text-base leading-relaxed"> {/* 16px, line-height 1.625 */}
  ConteÃºdo do parÃ¡grafo
</p>
```

## Performance

### MemoizaÃ§Ã£o

```typescript
import { memo, useMemo, useCallback } from 'react'

// Memo para componentes que recebem props estÃ¡veis
export const ProductCard = memo(function ProductCard({ product }: Props) {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>{product.price}</p>
    </div>
  )
})

// useMemo para cÃ¡lculos pesados
export function ProductList({ products, filter }: Props) {
  const filteredProducts = useMemo(() => {
    return products.filter(p => p.category === filter)
  }, [products, filter])

  return <ul>{filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}</ul>
}

// useCallback para funÃ§Ãµes passadas como props
export function Parent() {
  const [count, setCount] = useState(0)
  
  const handleClick = useCallback(() => {
    setCount(c => c + 1)
  }, [])
  
  return <Child onClick={handleClick} />
}
```

### Evitar Re-renders DesnecessÃ¡rios

```typescript
// âœ… CORRETO - Estado no nÃ­vel certo
export function Form() {
  return (
    <form>
      <UsernameInput /> {/* Estado isolado */}
      <PasswordInput /> {/* Estado isolado */}
    </form>
  )
}

function UsernameInput() {
  const [value, setValue] = useState('')
  return <input value={value} onChange={e => setValue(e.target.value)} />
}

// âŒ INCORRETO - Estado no pai causa re-render de tudo
export function Form() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  return (
    <form>
      <input value={username} onChange={e => setUsername(e.target.value)} />
      <input value={password} onChange={e => setPassword(e.target.value)} />
      <SomeOtherComponent /> {/* Re-renderiza sem necessidade */}
    </form>
  )
}
```

## Checklist de Componente

- [ ] Props tipadas corretamente com TypeScript
- [ ] Named export (nÃ£o default export)
- [ ] HTML semÃ¢ntico usado onde apropriado
- [ ] ARIA labels em elementos interativos sem texto
- [ ] Suporta navegaÃ§Ã£o por teclado
- [ ] Contraste adequado (WCAG AA mÃ­nimo)
- [ ] Responsivo (mobile-first)
- [ ] Botões de ação em tabelas: `h-10 w-10` no mobile
- [ ] Textos de botões ocultos no mobile quando apropriado
- [ ] Fontes maiores no mobile (`text-base` em tabelas)
- [ ] Estado isolado no nÃ­vel mais baixo possÃ­vel
- [ ] Memoizado se recebe props estÃ¡veis
- [ ] **Se for formulário:** Validação usando Zod conforme `.cursor/rules/form-validation.md`

## Responsividade Mobile

### Padrões Gerais de Mobile-First

**Princípio:** Sempre desenvolver mobile-first, depois adaptar para desktop usando breakpoints do Tailwind (`sm:`, `md:`, `lg:`, `xl:`).

### Tamanhos de Fonte em Mobile

**Padrão para tabelas e listagens:**
- Cabeçalhos de tabela: `text-sm sm:text-xs` (maior no mobile)
- Células de tabela: `text-base sm:text-sm` (maior no mobile)
- Textos secundários: `text-sm sm:text-sm` ou `text-xs sm:text-sm`
- Mensagens e labels: `text-sm sm:text-sm` ou `text-base sm:text-sm`

```typescript
// ✓ CORRETO - Fontes maiores no mobile
<th className="px-3 sm:px-6 py-3 text-left text-sm sm:text-xs font-medium text-gray-500">
  Nome
</th>
<td className="px-3 sm:px-6 py-3 sm:py-4 text-base sm:text-sm text-gray-900">
  {content}
</td>
```

### Botões em Tabelas e Listagens

Para botões de ação em tabelas e listagens, usar tamanho `h-10 w-10` no mobile para melhor usabilidade:

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

**Padrões:**
- Mobile: `h-10 w-10` (40px) para botões de ação em tabelas/listagens
- Desktop: `h-auto w-auto` (tamanho padrão do componente)
- Ícones: `h-5 w-5` no mobile, `h-4 w-4` no desktop
- Textos: Ocultar no mobile (`hidden sm:inline`), mostrar no desktop
- Padding: `p-2` em ambos os tamanhos
- Justify-center: Usar `justify-center` para centralizar ícones no mobile

### Cards Clicáveis em Mobile

Para cards que devem ser clicáveis no mobile:

```typescript
// ✓ CORRETO - Card clicável no mobile
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
- Botões de ação devem ter `z-index` maior que o conteúdo
- Usar `stopPropagation` nos botões para evitar navegação ao clicar neles

### Espaçamentos e Padding

**Padrões gerais:**
- Padding em cards: `p-4 sm:p-6` (menor no mobile)
- Gap entre elementos: `gap-1 sm:gap-2` ou `gap-2 sm:gap-3`
- Margin bottom: `mb-3 sm:mb-4` ou `mb-4 sm:mb-6`
- Padding horizontal em containers: `px-4 sm:px-6 lg:px-8`

### Tamanhos de Ícones

**Padrões:**
- Ícones pequenos: `h-4 w-4` (desktop) / `h-5 w-5` (mobile em botões de ação)
- Ícones médios: `h-5 w-5` (desktop) / `h-6 w-6` (mobile)
- Ícones grandes: `h-6 w-6` (desktop) / `h-8 w-8` (mobile)

### Resumo dos Padrões Mobile

| Elemento | Mobile | Desktop |
|----------|--------|---------|
| Botões ação (tabelas) | `h-10 w-10` | `h-auto w-auto` |
| Ícones em botões ação | `h-5 w-5` | `h-4 w-4` |
| Texto tabela | `text-base` | `text-sm` |
| Cabeçalho tabela | `text-sm` | `text-xs` |
| Padding cards | `p-4` | `p-6` |
| Gap elementos | `gap-1` ou `gap-2` | `gap-2` ou `gap-3` |
