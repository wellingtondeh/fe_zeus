# Criar PR

## Visão geral
Crie um pull request automaticamente via Azure DevOps CLI com descrição bem estruturada.

## Pré-requisitos
- Azure DevOps CLI instalado: `winget install Microsoft.AzureCLI`
- Extensão DevOps: `az extension add --name azure-devops`
- CLI autenticado (fazer login uma vez): `az login`
- Defaults configurados: `az devops configure --defaults organization=https://dev.azure.com/saudepetrobras project="Desligamento do SAM"`

## Etapas Automatizadas

### 1. Commit e Push
```bash
git add .
git commit -m "feat: descrição clara da mudança"
git push -u origin nome-do-branch
```

### 2. Criar PR Automaticamente

**⚠️ IMPORTANTE - Charset/Encoding:**
Para evitar problemas com acentuação (ç, ã, õ, etc), configure o encoding do PowerShell:

```powershell
# Configure UTF-8 no início da sessão
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

# Depois crie o PR
az repos pr create `
  --repository bt_contribuicao `
  --source-branch nome-do-branch `
  --target-branch desenv `
  --title "feat: Titulo descritivo" `
  --description "@DESCRICAO_PR.md"
```

**Alternativa:** Use títulos e descrições em inglês para evitar problemas de encoding.

**⚠️ Limite:** A descrição deve ter no máximo **4000 caracteres**. Use um arquivo .md e referencie com `@`.

## Estrutura da Descrição do PR

### Resumo
- Contexto e motivação
- O que foi feito
- Por que foi feito

### Alterações Principais
- Lista de mudanças
- Arquivos modificados/criados
- Métricas de impacto

### Breaking Changes (se houver)
- Liste mudanças que quebram compatibilidade
- Como migrar do código antigo

### Testes
- Casos de teste criados
- Como executar os testes
- Cobertura alcançada

### Checklist
- [ ] Código compila sem erros
- [ ] Testes unitários passaram
- [ ] Testes manuais concluídos
- [ ] Documentação atualizada
- [ ] Breaking changes documentados

## Dicas

### Título do PR
Use conventional commits:
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `refactor:` - Refatoração
- `docs:` - Documentação
- `test:` - Testes
- `chore:` - Manutenção

### Descrição
- Seja claro e objetivo
- Use markdown para formatação
- Inclua métricas quando relevante
- Adicione links para documentação
- **Limite de 4000 caracteres** - crie versão resumida se necessário
- **Evite caracteres especiais** ou configure UTF-8 corretamente

### Após Criar o PR
- **Revisar no navegador** - Verifique se acentuação está correta
- Adicionar labels manualmente (se necessário)
- Corrigir título/descrição se houver problemas de encoding
- Responder comentários dos revisores
- Fazer merge após aprovação

## Exemplo Completo

```powershell
# 0. Configure UTF-8 (IMPORTANTE!)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

# 1. Commit
git add .
git commit -m "feat: Implementa validacao de seguranca no Azure Service Bus

- Adiciona whitelist de pacotes permitidos
- Implementa validacao de tamanho de mensagem
- Corrige vulnerabilidades CWE-209 e CWE-502
- Adiciona 10 casos de teste unitarios

Breaking Changes:
- Metodo enviarParaFila() agora requer configuracao de whitelist
- Variaveis de ambiente obrigatorias"

# 2. Push
git push -u origin feature/minha-feature

# 3. Criar PR
az repos pr create `
  --repository bt_contribuicao `
  --source-branch feature/minha-feature `
  --target-branch desenv `
  --title "feat: Implementa validacao de seguranca no Azure Service Bus" `
  --description "@PR_DESCRIPTION.md"
```

## Troubleshooting

### ❌ Problema: Acentos corrompidos no título/descrição
**Exemplo:** "RefatoraÃ§Ã£o" ao invés de "Refatoração"

**Solução 1 - Configure UTF-8:**
```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
chcp 65001  # Define code page para UTF-8
```

**Solução 2 - Arquivo de descrição em UTF-8:**
```powershell
# Salve o arquivo com BOM UTF-8
$description | Out-File -FilePath "PR_DESC.md" -Encoding UTF8

# Use no PR
az repos pr create --description "@PR_DESC.md" ...
```

**Solução 3 - Use inglês:**
```bash
# Evite acentos completamente
--title "feat: Refactor Azure Service Bus with security improvements"
```

**Solução 4 - Edite no navegador:**
- Crie o PR com título/descrição simples
- Edite diretamente no Azure DevOps após criação

### ❌ Erro: "description must not be longer than 4000 characters"
**Solução:** Crie uma versão resumida da descrição ou use apenas os pontos principais.

### ❌ Erro: "TF401019: The Git repository with name or identifier does not exist"
**Solução:** Verifique se está no diretório correto e se o repositório está configurado:
```bash
az devops configure --defaults organization=https://dev.azure.com/saudepetrobras project="Desligamento do SAM"
```

### ❌ CLI não autenticado
**Solução:** Faça login:
```bash
az login
```

### ❌ Extensão DevOps não instalada
**Solução:** Instale a extensão:
```bash
az extension add --name azure-devops
```

## Script Completo Pronto para Uso

Salve como `criar-pr.ps1`:

```powershell
# Script para criar PR no Azure DevOps
param(
    [Parameter(Mandatory=$true)]
    [string]$SourceBranch,
    
    [Parameter(Mandatory=$true)]
    [string]$Title,
    
    [Parameter(Mandatory=$false)]
    [string]$TargetBranch = "desenv",
    
    [Parameter(Mandatory=$false)]
    [string]$DescriptionFile = "PR_DESCRIPTION.md"
)

# Configure UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
chcp 65001 | Out-Null

Write-Host "🚀 Criando Pull Request..." -ForegroundColor Cyan
Write-Host "   Source: $SourceBranch" -ForegroundColor White
Write-Host "   Target: $TargetBranch" -ForegroundColor White
Write-Host "   Title: $Title" -ForegroundColor White

try {
    $result = az repos pr create `
        --repository bt_contribuicao `
        --source-branch $SourceBranch `
        --target-branch $TargetBranch `
        --title $Title `
        --description "@$DescriptionFile" `
        --output json | ConvertFrom-Json
    
    Write-Host "`n✅ Pull Request criado com sucesso!" -ForegroundColor Green
    Write-Host "   ID: $($result.pullRequestId)" -ForegroundColor White
    Write-Host "   URL: https://dev.azure.com/saudepetrobras/Desligamento%20do%20SAM/_git/bt_contribuicao/pullrequest/$($result.pullRequestId)" -ForegroundColor Cyan
    
    # Abrir no navegador
    Start-Process "https://dev.azure.com/saudepetrobras/Desligamento%20do%20SAM/_git/bt_contribuicao/pullrequest/$($result.pullRequestId)"
    
} catch {
    Write-Host "`n❌ Erro ao criar Pull Request:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
```

**Uso:**
```powershell
.\criar-pr.ps1 -SourceBranch "feature/minha-feature" -Title "feat: Minha feature incrivel"
```
