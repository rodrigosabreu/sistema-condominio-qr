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
- Validação: `dotnet build backend/src/SistemaCondominio.Domain` passou sem erros nem avisos.

### Etapa 2: Infrastructure (concluída)
- [x] `AppDbContext` em `Infrastructure/Data/AppDbContext.cs`, com tabelas em snake_case (`condominios`, `usuarios`, `locais`, `qr_codes`, `servicos`, `registros_acesso`) e enums salvos como string
- [x] Primeira migration `InicialCriacao` em `Infrastructure/Data/Migrations/`
- [x] `Api/Program.cs` registra `AddDbContext` com `UseNpgsql`; connection string em `appsettings.Development.json`
- [x] Referência `Api -> Infrastructure` e pacote `Microsoft.EntityFrameworkCore.Design` na API (necessário para `dotnet ef`)
- Decisão: `dotnet-ef` instalado como ferramenta local em `.tools/` (versão 10.0.14). A versão global 7.0.4 é incompatível com EF Core 10.
- Comando usado: `./backend/.tools/dotnet-ef migrations add InicialCriacao --project backend/src/SistemaCondominio.Infrastructure --startup-project backend/src/SistemaCondominio.Api --output-dir Data/Migrations`

### Etapa 3: Banco local (concluída)
- [x] Docker Desktop operacional (o bloqueio anterior de WSL foi resolvido)
- [x] `docker compose up -d` sobe `condominio-db` (postgres:14-alpine, healthy) na porta 5432
- [x] Migration aplicada: `./backend/.tools/dotnet-ef database update --project backend/src/SistemaCondominio.Infrastructure --startup-project backend/src/SistemaCondominio.Api`. Tabelas criadas: `condominios`, `usuarios`, `locais`, `qr_codes`, `servicos`, `registros_acesso` (+ `__EFMigrationsHistory`)
- [x] pgAdmin corrigido: o e-mail `admin@condominio.local` era rejeitado (domínio `.local` é reservado). Trocado para `admin@condominio.com` em `docker-compose.yml`, `README.md` e `AGENTS.md`
- Decisão: testes unitários ficam para depois, quando a aplicação estiver 100% funcional (orientação do usuário)

### Etapa 4: API funcional (concluída)
- [x] Template `WeatherForecast` removido
- [x] `Application`: interfaces (`IAplicacaoDbContext`, `IHashSenha`, `IGeradorToken`), DTOs, exceções de negócio e serviços (`QrCodeService`, `LocalService`, `ServicoService`, `AutenticacaoService`)
- [x] `Auth`: hash de senha PBKDF2-SHA256 (210k iterações) e geração de JWT com claims `usuarioId`, `papel`, `geral` e `condominoId` (ausente para Super Admin)
- [x] Migration `AdicionarSenhaUsuario` (coluna `SenhaHash`), aplicada no banco
- [x] Endpoints: consulta anônima do QR, login, listar locais, PNG do QR (admin), listar/registrar/concluir serviços
- [x] Escopo de condomínio validado em todas as operações autenticadas; funcionário só conclui os próprios serviços
- [x] Rate limiting por IP (429) e tratamento global de exceções (JSON `erro`/`mensagem`)
- [x] Seed de desenvolvimento (2 condomínios, 4 usuários, 5 locais com QR Code)
- [x] Validado com curl ponta a ponta: 401/403/404/400/429, escopo entre condomínios, auditoria em `registros_acesso`
- Decisões: enums serializados em camelCase (`"banheiro"`); colunas do banco no padrão EF (PascalCase), só tabelas em snake_case; testes unitários ficam para depois (orientação do usuário)

### Etapa 5: Cadastros e edições com regras de permissão (concluída)
- [x] Regras documentadas no AGENTS.md ("Regras de Cadastro e Edição"), com matriz de permissões
- [x] Condomínios: criar (só Geral), editar (Geral ou admin do próprio; só Geral ativa/desativa), listar
- [x] Locais: criar (QR Code gerado automaticamente), editar, detalhar; admin só no próprio condomínio
- [x] Usuários: criar, editar, listar; admin só cria/edita funcionários do próprio condomínio, não promove nem move usuários, não edita administradores
- [x] Serviços: editar (admin do condomínio ou funcionário nos próprios)
- [x] Validações centralizadas (`Validacao`): campos obrigatórios, tamanhos, CNPJ (14 dígitos), e-mail, senha mínima 8, e-mail único
- [x] Senha nunca retornada nas respostas (`senhaHash` ausente)
- [x] Erro de JSON malformado retorna 400 (antes 500)
- [x] Rate limiting por usuário autenticado (fallback para IP em anônimos); antes era por IP para todos
- Validação: script com ~90 cenários de permissão. Na primeira rodada, todos os cenários passaram, exceto um (500 causado por JSON com UTF-8 inválido, corrigido para 400) e um erro do próprio script (ID vazio). Depois disso, uma segunda rodada completa foi bloqueada pelo rate limit (ainda por IP); a verificação posterior foi direcionada (edição de local, JSON inválido e limite por usuário), não uma nova rodada completa.
- Limitação encontrada: o rate limit por IP bloqueava administradores atrás do mesmo IP, o que levou à mudança para usuário autenticado.
- Observação: as rodadas de teste geraram registros duplicados no banco (locais de teste do Paineiras, usuários repetidos). Não foram removidos; limpar só com confirmação.

### Etapa 6: Frontend (concluída)
- [x] Projeto `frontend/` com React 19.3.1, React Router 7.18.4, Vite 8.3.4, Tailwind 4.3.3 e TypeScript 5.9.3 (versões fixas, todas com mais de 7 dias de publicação)
- [x] Telas: login, painel, condomínios, locais (criar/editar/ativar/desativar/QR PNG), serviços (histórico paginado, registrar, editar, concluir), usuários (criar/editar/ativar, troca de senha) e página pública do QR para moradores
- [x] Ações escondidas conforme o papel (espelho das regras do AGENTS.md); o backend continua sendo a fonte da verdade
- [x] Backend ajustado para o front: `GET /api/locais?incluirInativos=true` (admin), `usuarioId` no DTO de serviço, `condominioId`/`ativo` no resumo de local, e QR Code apontando para a página do front (`QrCode:UrlBase`)
- [x] Correção de segurança: `usuarioId` não é exposto na página pública do QR
- Validação: roteiro E2E com navegador real (Edge via DevTools), 33/33 verificações passando (login, erro de senha, criação e edição por papel, QR público, serviços, usuários, logout, layout mobile). Capturas revisadas visualmente.
- Observação: a sessão fica no `localStorage` (token JWT). É prático para este projeto, mas um XSS poderia roubar o token; uma evolução seria cookie HttpOnly.
- Observação: o roteiro E2E criou dados de teste (locais, condomínios e usuários com sufixo numérico). Não foram removidos.

### Etapa 7: Reorganização de pastas (concluída)
- [x] Backend movido para `backend/` (`SistemaCondominio.slnx`, `src/` e `.tools/`), espelhando `frontend/`
- [x] Compilação validada em `backend/SistemaCondominio.slnx`
- [x] Caminhos atualizados em AGENTS.md, README.md, PROGRESSO.md, `setup.sh` e `setup.bat`
- [x] `.gitignore` na raiz (bin, obj, node_modules, dist)
- Observação: os scripts `setup.sh`/`setup.bat` são históricos (geraram a estrutura inicial e não refletem o projeto atual, que tem `Validacao`, `Mapeamento` e serviços próprios). Foram mantidos com os caminhos corrigidos.
- Comandos novos: `dotnet build backend/SistemaCondominio.slnx`, `./backend/.tools/dotnet-ef ...`, `dotnet run --project backend/src/SistemaCondominio.Api`

## Pendências (não implementadas)
- Notificações por e-mail (SendGrid) e histórico de 12 meses
- FluentValidation e Serilog (validação e logs feitos manualmente / logging padrão do .NET)
- Atualização de `Microsoft.OpenApi` (aviso NU1903)
- Testes unitários (planejados para depois, quando tudo estiver estável)
