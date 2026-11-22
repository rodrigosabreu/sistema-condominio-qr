# Task: ATUALIZAR-MICROSOFT-OPENAPI-2.0.0

- **Project**: sistema-condominio-qr
- **Owner**: agente-hermes
- **Status**: pending
- **Approved**: pendente — aguarda aprovação humana para atualização de dependência com vulnerabilidade alta
- **Waiting**: aprovação humana para prosseguir com `dotnet add package` e validação de build
- **Next action**: obter aprovação e executar atualização do pacote `Microsoft.OpenApi` para versão sem vulnerabilidade NU1903

---

## Artifacts
- /opt/data/projects/sistema-condominio-qr/backend/src/SistemaCondominio.Api/SistemaCondominio.Api.csproj
- /opt/data/projects/sistema-condominio-qr/PROGRESSO.md

---

## History
- **2026-11-22 14:30** | descoberta | Tarefa identificada via análise do PROGRESSO.md: vulnerabilidade NU1903 em Microsoft.OpenApi 2.0.0 (usado por Microsoft.AspNetCore.OpenApi 10.0.7). Item listado em "Pendências (não implementadas)".

---

## Validation
- **Checks executed**: leitura do PROGRESSO.md, verificação do catálogo no agentic-home, leitura do AGENTS.md do projeto
- **Results**: projeto em estado funcional (Etapas 1-7 concluídas), build compila, API validada ponta a ponta, frontend funcional
- **Pending**: aprovação humana para atualização de dependência; execução de `dotnet build` pós-atualização; validação de que Swagger/OpenAPI continua funcionando

---

## Notes
- **Objetivo**: Resolver vulnerabilidade alta (NU1903) no pacote `Microsoft.OpenApi` 2.0.0 atualizando para versão segura compatível com .NET 10 / ASP.NET Core 10.0.x
- **Contexto relevante**: 
  - Projeto usa .NET 10 (`net10.0`) conforme decisão registrada no PROGRESSO.md (SDK 10.0.203 instalado)
  - `Microsoft.AspNetCore.OpenApi` 10.0.7 traz `Microsoft.OpenApi` 2.0.0 como dependência transitiva
  - Vulnerabilidade NU1903 = alta severidade
  - Validação atual feita manualmente via curl e roteiro E2E no navegador (33/33 passando)
  - Testes unitários ainda não implementados (planejados para depois)
- **Estado atual**: pendente — aguarda aprovação. Nenhuma alteração de código realizada.
- **Artefatos relacionados**: 
  - `backend/src/SistemaCondominio.Api/SistemaCondominio.Api.csproj` (onde a dependência transitiva entra)
  - `PROGRESSO.md` (linha 89: "Atualização de `Microsoft.OpenApi` (aviso NU1903)")
- **Próxima ação**: após aprovação, executar:
  1. `dotnet add backend/src/SistemaCondominio.Api package Microsoft.OpenApi --version <versão-segura>`
  2. `dotnet restore`
  3. `dotnet build backend/SistemaCondominio.slnx`
  4. Validar Swagger UI em `http://localhost:5234/swagger`
- **Critérios de aceite**:
  - [ ] `dotnet build` passa sem erros nem avisos NU1903
  - [ ] Swagger UI acessível e funcional (`/swagger`)
  - [ ] `dotnet list package --vulnerable` não reporta NU1903
  - [ ] API continua respondendo normalmente (smoke test: GET /api/qrcode/{id}, POST /api/auth/login)
- **Pendências e aprovações necessárias**:
  - Aprovação humana para atualização de dependência (critério de governança: mudança de dependência requer aprovação)
  - Definir versão alvo segura (verificar NuGet por versão sem vulnerabilidade compatível com ASP.NET Core 10.0.x)
  - Se houver breaking changes na API do OpenApi, avaliar impacto no Swagger/UI

---

## Rules (Reference)

1. **Task state lives in the responsible project** — not in the Home
2. **History is append-only** — never rewrite previous entries
3. **Record real artifact paths** — not placeholders
4. **Do not mark as approved without evidence** — link to PR, test results, approval record
5. **On blockage** — record the reason, update Status to `blocked`, and stop execution safely
6. **New session continuity** — a new session must be able to continue from this handoff alone