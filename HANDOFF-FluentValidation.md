# Task: Integração do FluentValidation — Substituição de validação manual

- **Project**: sistema-condominio-qr
- **Owner**: TCL (Tech Lead)
- **Status**: blocked
- **Approved**: — (nenhuma aprovação de implementação, contrato ou produção registrada)
- **Waiting**: 
  1. QA entregar especificação de regressão reproduzível (roteiro, ambiente, matriz, evidências) — **ENTREGUE: PLANO-REGRESSAO-FluentValidation.md**
  2. Rodrigo aprovar dependência FluentValidation (licença, versão, net10.0)
  3. TCL detalhar proposta técnica (versão exata, estrutura validators, ponto invocação, RNF01)
- **Next action**: Rodrigo aprovar dependência → TCL detalhar proposta técnica → PM validar → Implementação

---

## Artifacts
- /opt/data/projects/sistema-condominio-qr/DISCOVERY-FluentValidation.md
- /opt/data/projects/sistema-condominio-qr/HANDOFF-FluentValidation.md
- /opt/data/projects/sistema-condominio-qr/PROPOSTA-FluentValidation.md
- /opt/data/projects/sistema-condominio-qr/RESOLUCAO-BLOQUEADORES-FluentValidation.md (decisões de produto)
- /opt/data/projects/sistema-condominio-qr/PLANO-REGRESSAO-FluentValidation.md (especificação de regressão QA)

---

## History
- **2026-11-22 22:45** | Discovery | PM (Polaris) leu AGENTS.md e PROGRESSO.md, identificou pendência "FluentValidation e Serilog" no PROGRESSO.md seção Pendências, definiu escopo contido (apenas FluentValidation), produziu artifact de discovery
- **2026-11-22 22:45** | Handoff | PM registrou handoff para TCL no formato da Home (template handoff.md)
- **Análise TCL** | Inspecionados discovery, implementação e contrato do frontend na revisão e8a9b0bfc1a0eb82c0f7adc50f53f8e6e4cff0c7; proposta registrada em PROPOSTA-FluentValidation.md. Implementação bloqueada por divergências de contrato e aceite, necessidade de alinhamento de dependência e regressão reproduzível. Sem modificação de código, build ou testes; sem aprovação de implementação.
- **Resolução PM** | PM (Polaris) analisou bloqueadores do TCL e produziu RESOLUCAO-BLOQUEADORES-FluentValidation.md com decisões de produto: RNF03/CA07 reconciliados (envelope legado, CA07→Should), mensagens CA01/03/04 alinhadas ao código atual, CA05 removido do escopo, nomes DTOs reconciliados com reais, normalização preservada, CA07 rebaixado para Should. Pendências: QA (regressão), Rodrigo (dependência), TCL (detalhes técnicos).
- **Plano QA** | QA (Sentinel) produziu PLANO-REGRESSAO-FluentValidation.md com especificação completa de regressão: 120+ casos de teste, matriz de permissão, ambiente, baseline, estratégia de comparação, lacunas, riscos, critérios Go/No-Go. Identificados 120+ TCs cobrindo validação DTOs, autorização/escopo/precedência, binding, consultas, normalização. Matriz ~90 cenários históricos: script não localizado; QA definiu matriz mínima equivalente. Lacunas técnicas pendentes: versão FluentValidation, estrutura validators, ponto invocação, RNF01, aprovação dependência.

---

## Validation
- **Checks executed**: Leitura completa do AGENTS.md, PROGRESSO.md, DISCOVERY, HANDOFF, PROPOSTA, RESOLUCAO, código real (Dtos.cs, Validacao.cs, Services, TratamentoExcecoes, Endpoints, frontend/cliente.ts), documentação oficial FluentValidation
- **Results**: 
  - Validação manual atual funciona mas é frágil e repetida
  - FluentValidation listado no AGENTS.md mas não instalado
  - Minimal APIs + net10.0 → integração MVC automática não aplica
  - Envelope erro atual: `{ "erro", "mensagem" }` (primeiro erro) consumido por frontend
  - Normalização em Validacao.cs (trim, lowercase email, CNPJ dígitos, senha sem trim)
  - Ordem validação vs segurança varia por operação (papel → existência → escopo → validação)
  - ~90 cenários permissão: script não localizado; 2ª rodada incompleta
  - QA definiu plano de regressão com 120+ TCs, matriz mínima ~90 cenários, ambiente, baseline, critérios Go/No-Go
- **Pending**: 
  1. **Rodrigo**: aprovação dependência FluentValidation (licença Apache 2.0, versão, net10.0) — **Impeditivo**
  2. **TCL**: versão exata, estrutura validators, ponto invocação, medição RNF01 — **Impeditivo**
  3. **Dev/QA**: Preparar ambiente teste (rate limit, seed, dados) — Operacional

---

## Notes
- **Escopo deliberadamente contido**: Apenas FluentValidation (não Serilog, não e-mail, não testes unitários, não OpenApi). Isso reduz risco e permite entrega rápida.
- **Compatibilidade**: O formato de erro 400 atual retorna `{ "erro": "...", "mensagem": "..." }` (string única). FluentValidation por padrão retorna `ValidationProblemDetails` com array `errors`. **Decisão de produto**: manter envelope legado via customização (RNF03 Must), logando todos erros internamente. CA07 rebaixado para Should.
- **Validações de negócio (escopo, permissão, rate limit) permanecem no service** — FluentValidation cobre apenas validação de *entrada* (DTOs), não regras de estado.
- **Mensagens em pt-BR**: Alinhadas ao código atual (`Validacao.cs`): CA01 "CNPJ deve conter 14 dígitos", CA03 "A senha deve ter no mínimo 8 caracteres", CA04 contextual ("Nome do local é obrigatório" / "Nome é obrigatório").
- **CA05**: Removido do escopo — binding nativo do enum `TipoServico` já valida.
- **DTOs reais**: `CondominioRequest`, `LocalRequest`, `UsuarioRequest` (compartilhados create/update), `RegistrarServicoRequest`, `AtualizarServicoRequest`, `ConcluirServicoRequest`, `LoginRequest`. Sem `TrocarSenhaRequestDto` separado.
- **Normalização preservada**: trim obrigatórios/opcionais, email lowercase, CNPJ extrai dígitos, senha sem trim — ocorre **antes** da validação FluentValidation.
- **Dependência**: `FluentValidation` (base, não AspNetCore) — compatível com .NET 10. Aguarda aprovação.
- **Risco baixo**: Mudança isolada na camada de validação de entrada; build e testes manuais existentes servem como regressão.
- **Arquivos principais a tocar**: `backend/src/SistemaCondominio.Application/Validators/*.cs` (novos), `backend/src/SistemaCondominio.Api/Program.cs` (registro DI explícito), remoção chamadas `Validacao.*` nos services correspondentes.

---

## Evidências QA Encontradas

| Item | Evidência | Localização |
|------|-----------|-------------|
| **Endpoints afetados** | 9 endpoints de mutação + 6 consultas | PLANO-REGRESSAO seção 1.1 |
| **Validações atuais** | 5 métodos em Validacao.cs + validações inline nos services | PLANO-REGRESSAO seção 2.1-2.2 |
| **Normalização** | trim, email lowercase, CNPJ dígitos, senha sem trim | PLANO-REGRESSAO seção 2.1, 3.6 |
| **Precedência** | Papel → Existência → Escopo → Validação (varia por service) | PLANO-REGRESSAO seção 1.3, 3.3 |
| **Binding enum** | Nativo ASP.NET Core (rejeita inválidos) | PLANO-REGRESSAO seção 2.3 |
| **Envelope erro** | `{ "erro", "mensagem" }` primeiro erro | TratamentoExcecoes.cs, cliente.ts |
| **~90 cenários** | Script não localizado; matriz mínima definida por QA | PLANO-REGRESSAO seção 5 |
| **Frontend E2E** | 33/33 passando (Edge DevTools) | PROGRESSO.md:74 |

---

## Estratégia de Regressão (Resumo)

1. **Baseline**: Capturar contra commit e8a9b0b (HTTP responses, status codes, envelopes, mensagens, precedência, normalização, DB state, perf, build)
2. **Pós-migração**: Comparar diff item a item — critério: zero divergências não documentadas
3. **Matriz permissão**: 90+ cenários (5 papéis × 6 recursos × CRUD + bordas) — script original não localizado, QA definiu matriz mínima
4. **Ambiente**: Docker Compose (PostgreSQL 14), rate limit desabilitado/alto, seed conhecida (2 cond, 4 users, 5 locais), dados duplicados mantidos
5. **Critérios Go/No-Go**: 100% TCs Must passam, zero divergências não doc, evidências 100% salvas

---

## Pendências (Impeditivas)

| # | Pendência | Responsável | Criticidade | Status |
|---|-----------|-------------|-------------|--------|
| 1 | Aprovação dependência FluentValidation (licença Apache 2.0, versão, net10.0) | **Rodrigo** | **Impeditivo** | ⏳ Pendente |
| 2 | Detalhamento técnico: versão exata, estrutura validators, ponto invocação, medição RNF01 | **TCL (Atlas)** | **Impeditivo** | ⏳ Pendente |
| 3 | Preparar ambiente QA (rate limit desabilitado, seed, dados duplicados) | **Dev/QA** | Operacional | ⏳ Pendente |
| 4 | Capturar baseline (commit e8a9b0b) | **QA** | Pré-impl | ⏳ Pendente |
| 5 | Aprovação plano Go/No-Go | **PM** | Governança | ⏳ Pendente |

---

## Próximo Responsável

| Agente | Atividade |
|--------|-----------|
| **Rodrigo** | Aprovar dependência FluentValidation (licença, versão, net10.0) |
| **TCL (Atlas)** | Após aprovação: detalhar proposta técnica (versão exata, estrutura validators, ponto invocação, RNF01) |
| **PM (Polaris)** | Validar proposta técnica não invade decisões de produto; aprovar Go/No-Go |
| **Dev** | Preparar ambiente QA (appsettings.Test.json, rate limit alto, seed) |
| **QA** | Capturar baseline; executar regressão pós-impl |

---

## Rules (Reference)
1. Task state lives in the responsible project — not in the Home
2. History is append-only — never rewrite previous entries
3. Record real artifact paths — not placeholders
4. Do not mark as approved without evidence — link to PR, test results, approval record
5. On blockage — record the reason, update Status to `blocked`, and stop execution safely
6. New session continuity — a new session must be able to continue from this handoff alone