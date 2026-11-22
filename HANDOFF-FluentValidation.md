# Task: Integração do FluentValidation — Substituição de validação manual

- **Project**: sistema-condominio-qr
- **Owner**: TCL (Tech Lead)
- **Status**: pending
- **Approved**: —
- **Waiting**: Aprovação do TCL para iniciar implementação
- **Next action**: TCL revisar discovery, aprovar ou solicitar ajustes; se aprovado, iniciar implementação no backend

---

## Artifacts
- /opt/data/projects/sistema-condominio-qr/DISCOVERY-FluentValidation.md
- /opt/data/projects/sistema-condominio-qr/HANDOFF-FluentValidation.md

---

## History
- **2026-11-22 22:45** | Discovery | PM (Polaris) leu AGENTS.md e PROGRESSO.md, identificou pendência "FluentValidation e Serilog" no PROGRESSO.md seção Pendências, definiu escopo contido (apenas FluentValidation), produziu artifact de discovery
- **2026-11-22 22:45** | Handoff | PM registrou handoff para TCL no formato da Home (template handoff.md)

---

## Validation
- **Checks executed**: Leitura completa do AGENTS.md (regras de validação, DTOs, endpoints, mensagens em pt-BR) e PROGRESSO.md (etapas concluídas, pendências, decisões técnicas, script de ~90 cenários de permissão)
- **Results**: Validação manual atual funciona mas é frágil e repetida; FluentValidation listado como biblioteca principal no AGENTS.md mas não instalado; todos os endpoints cobertos pelo script de permissão devem continuar passando
- **Pending**: Aprovação do TCL; validação técnica de esforço e riscos; confirmação de que formato de erro 400 atual (`{ "erro": "...", "mensagem": "..." }`) será mantido ou migrado para `ValidationProblemDetails` com compatibilidade

---

## Notes
- **Escopo deliberadamente contido**: Apenas FluentValidation (não Serilog, não e-mail, não testes unitários, não OpenApi). Isso reduz risco e permite entrega rápida.
- **Compatibilidade**: O formato de erro 400 atual retorna `{ "erro": "...", "mensagem": "..." }` (string única). FluentValidation por padrão retorna `ValidationProblemDetails` com array `errors`. Decisão necessária: (a) manter formato legado via customização, ou (b) migrar para RFC 7807 e atualizar frontend. Recomendação inicial: (a) para zero breaking changes.
- **Validações de negócio (escopo, permissão, rate limit) permanecem no service** — FluentValidation cobre apenas validação de *entrada* (DTOs), não regras de estado.
- **Mensagens em pt-BR**: Todos os validators devem usar mensagens em português brasileiro, consistentes com as atuais (`Validacao.cs`).
- **Dependência**: `FluentValidation.AspNetCore` (compatível com .NET 10 / ASP.NET Core 10).
- **Risco baixo**: Mudança isolada na camada de validação de entrada; build e testes manuais existentes servem como regressão.
- **Arquivos principais a tocar**: `backend/src/SistemaCondominio.Api/Program.cs` (registro DI), novos arquivos `Validators/*.cs` em `Application` ou `Api`, remoção de chamadas `Validacao.*` nos services correspondentes.

---

## Rules (Reference)
1. Task state lives in the responsible project — not in the Home
2. History is append-only — never rewrite previous entries
3. Record real artifact paths — not placeholders
4. Do not mark as approved without evidence — link to PR, test results, approval record
5. On blockage — record the reason, update Status to `blocked`, and stop execution safely
6. New session continuity — a new session must be able to continue from this handoff alone