# Resolução de Bloqueadores — FluentValidation

**Projeto**: sistema-condominio-qr
**Autor**: PM (Polaris)
**Data**: 2026-11-22
**Referência**: Commit e8a9b0bfc1a0eb82c0f7adc50f53f8e6e4cff0c7
**Documentos base**: DISCOVERY-FluentValidation.md, HANDOFF-FluentValidation.md, PROPOSTA-FluentValidation.md, PROGRESSO.md, AGENTS.md

---

## 1. Reconciliação RNF03 ↔ CA07 — Contrato de Erro e Consumidores

### Contrato Atual (Observado)
- **Formato**: `{ "erro": "...", "mensagem": "..." }` — string única (primeiro erro)
- **Status HTTP**: 400
- **Consumidor principal**: Frontend React (`frontend/src/api/cliente.ts:66-78`) — lê `mensagem` primeiro, depois `erro`
- **Comportamento**: Apenas o **primeiro erro** é retornado

### Decisão de Produto
| Item | Decisão | Justificativa |
|------|---------|---------------|
| **Envelope de erro** | **Manter envelope legado** (`{ "erro", "mensagem" }`) | RNF03 (zero breaking changes) tem prioridade Must; frontend não consome `errors` array |
| **CA07 (múltiplos erros)** | **Rebaixar para Should** — não bloqueante | Satisfazer CA07 exigiria mudança de contrato (quebraria RNF03 Must) ou duplicação de campo sem consumo real |
| **Estratégia** | FluentValidation retorna todos os erros internamente; mapeia para o primeiro erro no envelope legado; loga todos para auditoria | Preserva compatibilidade, atende RNF03, permite evolução futura sem breaking change |

### Impacto nos Critérios
- **RNF03 (Must)**: ✅ Atendido — contrato público inalterado
- **CA07 (Should)**: ⚠️ Parcial — retorna primeiro erro, loga todos; documentado como limitação conhecida
- **RF02 (Must)**: ✅ Atendido — formato `erro`/`mensagem` em pt-BR mantido

---

## 2. Revisão das Mensagens Literais (CA01, CA03, CA04)

| Critério | Discovery (CA) | Código Atual (`Validacao.cs`) | Decisão |
|----------|----------------|-------------------------------|---------|
| **CA01** | "CNPJ deve conter 14 dígitos numéricos" | "CNPJ deve conter 14 dígitos" | **Alinhar ao código atual** — remover "numéricos" (redundante, CNPJ só tem dígitos) |
| **CA03** | "Senha deve ter no mínimo 8 caracteres" | "A senha deve ter no mínimo 8 caracteres" | **Alinhar ao código atual** — manter artigo "A" |
| **CA04** | "Nome é obrigatório" | "Nome do local é obrigatório" (local) / "Nome é obrigatório" (outros) | **Especificar por contexto** — usar "Nome do local é obrigatório" para local, "Nome é obrigatório" para condomínio/usuário |

> **Nota**: Mensagens devem ser consistentes com `Validacao.cs` (fonte da verdade atual). FluentValidation usará as mesmas strings.

---

## 3. Especificação CA05 — Tipo de Serviço Inválido

### Análise
- **Discovery pede**: Validação de "Tipo de serviço inválido" no POST `/api/servicos`
- **Código atual**: `TipoServico` é enum (`Limpeza`, `Manutencao`, `Interdicao`, `Preventiva`, `Jardinagem`, `Horta`). Binding do ASP.NET Core já rejeita valores fora do enum (retorna 400 automático com mensagem padrão do framework)
- **Enum textual vs numérico**: Frontend envia string (ex: `"Limpeza"`); binding aceita string ou número

### Decisão de Produto
| Item | Decisão |
|------|---------|
| **Requisito explícito** | **Não há regra de negócio adicional** além do binding nativo do enum |
| **CA05** | **Remover do escopo** — validação já ocorre no model binding; não duplicar |
| **Se necessário futuramente** | Adicionar validator customizado apenas se regra de negócio exigir (ex: restringir tipos por papel) |

---

## 4. Reconciliação de Nomes dos DTOs

| Discovery (Discovery) | Código Real (`Dtos.cs`) | Observação | Decisão |
|----------------------|------------------------|------------|---------|
| `RegistrarCondominioRequestDto` / `AtualizarCondominioRequestDto` | `CondominioRequest` (compartilhado create/update) | Um DTO para ambas operações | **Usar nomes reais** — criar validators para `CondominioRequest` com regras condicionais por operação |
| `RegistrarLocalRequestDto` / `AtualizarLocalRequestDto` | `LocalRequest` (compartilhado) | Mesmo padrão | **Usar `LocalRequest`** |
| `RegistrarUsuarioRequestDto` / `AtualizarUsuarioRequestDto` | `UsuarioRequest` (compartilhado; senha obrigatória no create, opcional no update) | Mesmo DTO | **Usar `UsuarioRequest`** com regras condicionais |
| `TrocarSenhaRequestDto` | **Não existe** — troca de senha integrada na edição de usuário | Endpoint único | **Remover do escopo** — validator para `UsuarioRequest` cobre |
| `RegistrarServicoRequestDto` / `AtualizarServicoRequestDto` / `ConcluirServicoRequestDto` | `RegistrarServicoRequest`, `AtualizarServicoRequest`, `ConcluirServicoRequest` | DTOs separados por operação | **Usar nomes reais** |
| `LoginRequestDto` | `LoginRequest` | Nome real | **Usar `LoginRequest`** |

> **Ação**: Atualizar Discovery/Handoff com nomes reais antes de implementação. Validators serão criados por tipo real.

---

## 5. Preservação de Normalização Atual

Comportamentos em `Validacao.cs:7-48` que **devem ser preservados** (não são decisões técnicas, são comportamentos de produto):

| Campo | Normalização Atual | Decisão |
|-------|-------------------|---------|
| Obrigatórios/opcionais | `trim()` — vazio vira `null` | ✅ Preservar |
| Email | `ToLowerInvariant()` + trim | ✅ Preservar |
| CNPJ | Extrai apenas dígitos (`char.IsDigit`); se zero dígitos → `null` | ✅ Preservar |
| Senha | **Sem trim** — preserva espaços intencionais | ✅ Preservar |

**Implementação**: Normalização ocorre **antes** da validação FluentValidation (no service ou em transformer), não dentro dos validators. Validators recebem valores já normalizados e apenas validam.

---

## 6. Definição de Evidências de Regressão (Solicitação ao QA)

### Solicitação Formal ao QA (Sentinel)

| Item | Requerimento | Detalhamento |
|------|-------------|--------------|
| **Matriz de permissão** | Roteiro reproduzível dos ~90 cenários | Documentar: endpoint, papel, input esperado, status code esperado, regra de 403/404/429 |
| **Ambiente** | Isolado, com seed conhecida | Docker Compose + seed de dev (2 condomínios, 4 usuários, 5 locais) |
| **Rate limiting** | Limites adequados para execução completa | Configurar limite alto ou desabilitar temporariamente no ambiente de teste |
| **Evidências** | Logs + resposta HTTP + payload | Salvar em artefatos versionados (ex: `qa/evidence/`) |
| **Critérios CA08** | Todos os cenários passam com mesmos status codes | Comparar com baseline pré-migração |
| **Dados existentes** | Não limpar sem autorização | Manter registros de teste do Paineiras/usuários repetidos |

**Responsável**: QA (Sentinel) — definir roteiro e ambiente antes de desbloquear implementação.

---

## 7. Separação: Decisões de Produto vs. Técnicas

| Decisão | Tipo | Responsável | Status |
|---------|------|-------------|--------|
| Envelope de erro legado vs `ValidationProblemDetails` | **Produto** | PM + Contrato | ✅ Decidido (legado) |
| CA07 como Must vs Should | **Produto** | PM | ✅ Decidido (Should) |
| Mensagens literais (CA01/03/04) | **Produto** | PM | ✅ Decidido (alinhar ao código) |
| CA05 mantido/removido | **Produto** | PM | ✅ Decidido (removido) |
| Nomes dos DTOs no Discovery | **Produto** | PM | ✅ Decidido (nomes reais) |
| Normalização (trim, lowercase, CNPJ, senha) | **Produto** | PM | ✅ Decidido (preservar) |
| Requisitos de evidência de regressão | **Produto** | PM + QA | ✅ Solicitado ao QA |
| Pacote FluentValidation (base vs AspNetCore) | **Técnica** | TCL | ⏳ Pendente |
| Versão exata, licença, suporte net10.0 | **Técnica** | TCL | ⏳ Pendente |
| Estrutura de validators (por operação vs por DTO) | **Técnica** | TCL | ⏳ Pendente |
| Ponto de invocação (service vs filter) | **Técnica** | TCL | ⏳ Pendente |
| Medição RNF01 (<5ms) | **Técnica** | TCL + QA | ⏳ Pendente |

---

## 8. Dúvidas que Dependem de Aprovação Humana (Rodrigo)

| # | Questão | Impacto | Urgência |
|---|---------|---------|----------|
| 1 | **Dependência FluentValidation**: Aprovar adição de `FluentValidation` (base, não AspNetCore) ao projeto `Application`? Verificar licença (Apache 2.0), suporte net10.0, política de dependências. | Bloqueia implementação | Alta |
| 2 | **Dados de teste existentes**: Autorizar limpeza dos registros duplicados do Paineiras/usuários repetidos no banco de dev antes da regressão formal? | Afeta baseline de CA08 | Média |
| 3 | **Rate limiting em ambiente de teste**: Desabilitar ou elevar limite temporariamente para execução completa dos ~90 cenários? | Bloqueia CA08 | Alta |
| 4 | **Estratégia de erro futuro**: Se decisão posterior migrar para RFC 7807 (`errors` array), aprovar quebra de contrato coordenada com frontend? | Fora do escopo atual, mas decisão estratégica | Baixa |

---

## Resumo de Bloqueadores

| Bloqueador | Status | Responsável | Próxima Ação |
|------------|--------|-------------|--------------|
| RNF03 ↔ CA07 reconciliado | ✅ **Resolvido** | PM | Envelope legado mantido; CA07 → Should |
| Mensagens CA01/CA03/CA04 | ✅ **Resolvido** | PM | Alinhar ao código atual (`Validacao.cs`) |
| CA05 especificado | ✅ **Resolvido** | PM | Removido do escopo (binding nativo cobre) |
| Nomes DTOs reconciliados | ✅ **Resolvido** | PM | Discovery atualizado com nomes reais |
| Normalização preservada | ✅ **Resolvido** | PM | Documentado; fora dos validators |
| Evidências regressão (QA) | ⏳ **Pendente** | QA (Sentinel) | Definir roteiro, ambiente, matriz |
| Dependência FluentValidation | ⏳ **Pendente** | Rodrigo (aprovação) + TCL (versão) | Aprovar adição + fixar versão |
| Script ~90 cenários | ⏳ **Pendente** | QA + PM | Recuperar ou aprovar alternativa reproduzível |

---

## Próximo Agente Responsável

| Agente | Atividade |
|--------|-----------|
| **QA (Sentinel)** | Definir roteiro de regressão reproduzível, ambiente isolado, matriz de permissão, evidências. Entregar especificação antes de desbloquear. |
| **TCL (Atlas)** | Após QA entregar: fixar versão FluentValidation, confirmar licença/net10.0, detalhar estrutura de validators, ponto de invocação, medir RNF01. |
| **PM (Polaris)** | Acompanhar alinhamentos; validar decisões técnicas não invadam decisões de produto. |

---

## Atualização do Handoff

O arquivo `HANDOFF-FluentValidation.md` deve ser atualizado com:
- Status: `blocked` (mantido)
- Decisões de produto registradas acima
- Pendências: QA (regressão), Rodrigo (dependência), TCL (detalhes técnicos)
- Próxima ação: QA entregar especificação de regressão → TCL detalhar proposta → PM validar → Rodrigo aprovar dependência

---

*Este documento registra apenas decisões de produto. Decisões técnicas permanecem com o TCL. Nenhuma implementação autorizada enquanto houver pendências impeditivas.*