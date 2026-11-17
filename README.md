# Login SSO App

Aplicação de login com suporte a SSO (Single Sign-On) usando Google, Microsoft, Facebook e Instagram.

## Funcionalidades

- ✅ Login tradicional com email/senha (validação, rate limiting)
- ✅ Botões SSO para Google, Microsoft, Facebook e Instagram
- ✅ Layout responsivo mobile-first
- ✅ Estados de loading e tratamento de erros
- ✅ Acessibilidade completa (WCAG AA)

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# URL da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=seu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_google_client_secret_aqui

# Microsoft OAuth
MICROSOFT_CLIENT_ID=seu_microsoft_client_id_aqui
MICROSOFT_CLIENT_SECRET=seu_microsoft_client_secret_aqui

# Facebook/Instagram OAuth
FACEBOOK_CLIENT_ID=seu_facebook_client_id_aqui
FACEBOOK_CLIENT_SECRET=seu_facebook_client_secret_aqui
INSTAGRAM_CLIENT_ID=seu_instagram_client_id_aqui

# JWT Secret (gerar uma string aleatória segura)
JWT_SECRET=sua_chave_secreta_jwt_aqui
```

### Como obter as credenciais OAuth

#### Google
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em "APIs & Services" > "Credentials"
4. Clique em "Create Credentials" > "OAuth client ID"
5. Configure os redirect URIs: `http://localhost:3000/api/auth/sso/google/callback`

#### Microsoft
1. Acesse [Azure Portal](https://portal.azure.com/)
2. Vá em "Azure Active Directory" > "App registrations"
3. Clique em "New registration"
4. Configure os redirect URIs: `http://localhost:3000/api/auth/sso/microsoft/callback`

#### Facebook/Instagram
1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Crie um novo app
3. Adicione o produto "Facebook Login"
4. Configure os redirect URIs: `http://localhost:3000/api/auth/sso/facebook/callback`

## Instalação

```bash
# Instalar dependências
pnpm install

# Executar em desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Executar em produção
pnpm start
```

## Estrutura do Projeto

```
/app
  /api
    /auth
      /login          # API route para login tradicional
      /sso            # API routes para SSO
  /login              # Página de login
/components
  /ui                 # Componentes base (Button, Input, Card)
  /features
    /login            # Componente de formulário de login
/lib
  /validations        # Schemas Zod
  rate-limit.ts       # Rate limiting utility
  utils.ts            # Utilitários (cn helper)
```

## Segurança

- ✅ Validação server-side com Zod
- ✅ Rate limiting (5 tentativas por minuto)
- ✅ Headers de segurança configurados
- ✅ Proteção CSRF
- ✅ Validação de entrada sanitizada

## Acessibilidade

- ✅ Suporte completo a navegação por teclado
- ✅ ARIA labels e roles apropriados
- ✅ Contraste adequado (WCAG AA)
- ✅ Mensagens de erro claras e acessíveis
- ✅ Estados de loading anunciados

## Teste de Login

Para testar o login tradicional, use:
- Email: `demo@example.com`
- Senha: `demo123456`

**Nota:** Esta é apenas uma simulação. Em produção, você deve implementar a verificação real de credenciais com banco de dados e hash de senha.
