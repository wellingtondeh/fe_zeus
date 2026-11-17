# Padroes de Teste


**Tipo:** Agent Requested
**DescriÃ§Ã£o:** PadrÃµes e convenÃ§Ãµes para testes - Vitest, Testing Library, Playwright e boas prÃ¡ticas

## Estrutura de Testes

### OrganizaÃ§Ã£o de Arquivos

```
app/
  products/
    page.tsx
    page.test.tsx          # Teste da pÃ¡gina

components/
  ui/
    button.tsx
    button.test.tsx        # Teste do componente

lib/
  utils.ts
  utils.test.ts          # Teste de utilitÃ¡rios

tests/
  e2e/                   # Testes E2E com Playwright
    auth.spec.ts
    checkout.spec.ts
  integration/           # Testes de integraÃ§Ã£o
    api.test.ts
```
