# Progresso da Implementação

Acompanhamento passo a passo do projeto. Cada etapa registra o que foi feito, decisões e o próximo passo.

## Decisões

- **Framework**: .NET 10 (`net10.0`), mantido mesmo com o AGENTS.md citando .NET 8. Motivo: SDK 10.0.203 já instalado e projetos já gerados nessa versão.
- **Banco**: PostgreSQL 14 via `docker-compose.yml` (raiz).

## Estado inicial (antes desta sessão)

- Solução `SistemaCondominio.slnx` com 5 projetos em `src/` (Api, Application, Auth, Domain, Infrastructure). Build compila.
- `Api/Program.cs` ainda é o template padrão (`/weatherforecast`).
- Projetos Application, Auth, Domain e Infrastructure contêm apenas `Class1.cs` placeholder.
- Nada foi commitado; `src/` e o `.slnx` estavam como não rastreados.
- Avisos conhecidos: NU1903 (vulnerabilidade alta) em `Microsoft.OpenApi` 2.0.0, usado pelo `Microsoft.AspNetCore.OpenApi` 10.0.7.

## Etapas

### Etapa 1: Domain (concluída)
- [x] Enums em `Domain/Enums/Enums.cs`: `TipoLocal`, `TipoServico`, `StatusServico`, `PapelUsuario`
- [x] Entidades em `Domain/Entities/Entidades.cs`: `Condominio`, `Usuario`, `Local`, `QrCode`, `Servico`, `RegistroAcesso`
- Decisão: `PapelUsuario` é enum, e não a tabela `papeis` do AGENTS.md, para simplificar. Revisar se precisar de papéis configuráveis.
- Decisão: `QrCode` guarda `CondominioId` redundante, para a validação de escopo sem join.
- Validação: `dotnet build src/SistemaCondominio.Domain` passou sem erros nem avisos.

### Etapa 2: Infrastructure (concluída)
- [x] `AppDbContext` em `Infrastructure/Data/AppDbContext.cs`, com tabelas em snake_case (`condominios`, `usuarios`, `locais`, `qr_codes`, `servicos`, `registros_acesso`) e enums salvos como string
- [x] Primeira migration `InicialCriacao` em `Infrastructure/Data/Migrations/`
- [x] `Api/Program.cs` registra `AddDbContext` com `UseNpgsql`; connection string em `appsettings.Development.json`
- [x] Referência `Api -> Infrastructure` e pacote `Microsoft.EntityFrameworkCore.Design` na API (necessário para `dotnet ef`)
- Decisão: `dotnet-ef` instalado como ferramenta local em `.tools/` (versão 10.0.14). A versão global 7.0.4 é incompatível com EF Core 10.
- Comando usado: `./.tools/dotnet-ef migrations add InicialCriacao --project src/SistemaCondominio.Infrastructure --startup-project src/SistemaCondominio.Api --output-dir Data/Migrations`

### Etapa 3: Banco local (BLOQUEADA)
- [ ] Subir `docker-compose up -d` e validar conexão
  - Bloqueio: Docker Desktop não inicia ("Docker Desktop is unable to start").
  - Diagnóstico (log `com.docker.backend.exe.log`): falha ao criar a VM do WSL com `ERROR_DEVICE_REMOVED` (`wsl --import-in-place docker-desktop`). Problema no WSL do Windows, não no projeto.
  - Ação necessária: `wsl --shutdown` e reiniciar o Docker Desktop; se persistir, reiniciar o Windows ou atualizar o WSL (`wsl --update`). Nenhum PostgreSQL local instalado como alternativa.
- [ ] Aplicar migration: `./.tools/dotnet-ef database update --project src/SistemaCondominio.Infrastructure --startup-project src/SistemaCondominio.Api`

## Próximos passos (fora desta lista)
- Endpoint anônimo `GET /api/qrcode/{id}`
- Autenticação JWT e endpoints autenticados
- Rate limiting, auditoria, QRCoder, FluentValidation, Serilog
- Remover o template `WeatherForecast`
