# Sistema de Gestão de Condomínios com QR Codes

Sistema seguro para condomínios onde QR Codes em locais comuns permitem aos condôminos acessar informações sobre serviços, manutenções, interdições e outros eventos, com isolamento de dados baseado em papéis de acesso.

## Funcionalidades

- QR Codes posicionados em locais do condomínio (banheiros, salões, churrasqueiras, jardins, hortas, etc.)
- Moradores escaneiam QR Codes com smartphones para visualizar informações (sem cadastro, acesso anônimo)
- Funcionários registram e concluem serviços (limpeza, manutenção, jardinagem)
- Administradores gerenciam locais, serviços e usuários do condomínio
- Histórico acessível via link único por QR Code
- Notificações por email para administradores sobre eventos
- Contagem de visualizações de QR Codes para rastreamento de uso

## Segurança e Isolamento de Dados

### Isolamento por Papel
- **Moradores (anônimos)**: Acesso irrestrito a QR Codes públicos. Podem escanear QR Codes de qualquer condomínio sem autenticação.
- **Funcionários/Administradores (cadastrados)**: Isolamento obrigatório por condomínio. Apenas acessam dados do próprio condomínio.
- **Super Admin**: Acesso total a todos os condomínios.

### Segurança Geral
- **Autenticação JWT**: Tokens com escopo limitado ao condomínio do usuário (apenas para endpoints autenticados)
- **Validação de UUID**: IDs devem ser UUIDs válidos
- **Auditoria de acesso**: Logs de todas as consultas (incluindo acessos anônimos)
- **Rate limiting**: Proteção contra scraping e ataques
- **Prevenção de horizontal privilege escalation**: Usuários cadastrados não acessam dados de outros condomínios

## Papéis e Permissões

### Super Admin
- Acesso total a todos os condomínios
- Gerencia administradores de condomínio
- Dashboard consolidado
- Bypass de validação de condomínio

### Administrador de Condomínio
- Acesso limitado ao seu condomínio
- Gerencia locais, serviços e funcionários
- Recebe notificações por email

### Funcionário
- Registra e conclui serviços do condomínio
- Visualiza dados do seu condomínio
- Não edita serviços de outros usuários

### Moradores
- Acesso livre sem cadastro (anônimo)
- Apenas visualização via QR Code
- Podem escanear QR Codes de qualquer condomínio
- Não registra serviços

## Componentes

- **Gerador de QR Codes**: Sistema de geração de QR Codes únicos por local
- **API de Consulta Anônima**: Endpoint público para moradores (`/api/qrcode/{qr_code_id}`) sem autenticação
- **API de Consulta Autenticada**: Endpoints protegidos para funcionários/administradores com validação de escopo por condomínio
- **Dashboard Administrativo**: Gestão de locais, serviços e QR Codes (por condomínio)
- **Gateway de Autenticação**: Validação de JWT e verificação de escopo
- **Banco de Dados**: Armazenamento com isolamento baseado em papéis de acesso
- **Sistema de Notificações**: Envio de emails para administradores

## Documentação para Agentes de IA

Este projeto utiliza o arquivo `AGENTS.md` para orientar agentes de IA no desenvolvimento. O documento define:

- **Stack Tecnológica**: C# .NET 8, ASP.NET Core, PostgreSQL, Entity Framework Core
- Bibliotecas recomendadas (QRCoder, JWT, SendGrid, FluentValidation, Serilog, xUnit, Moq)
- Estrutura de projeto (Clean Architecture)
- Comandos dotnet para desenvolvimento
- Schema de banco de dados com suporte a acessos anônimos
- Endpoints API anônimos (moradores) e autenticados (funcionários/administradores)
- Exemplos de código em C# para todos os endpoints
- Isolamento de dados baseado em papéis de acesso
- Schema do token JWT com todos os campos documentados
- Validações de segurança específicas por tipo de usuário
- Padrões de localização (português)
- Requisitos de qualidade e acessibilidade

Para mais informações sobre engenharia agêntica, veja as postagens no LinkedIn sobre o tema.

## Como Começar

### Pré-requisitos
- .NET 8 SDK
- Docker e Docker Compose (para PostgreSQL local)
- IDE: Visual Studio 2022 Community ou VS Code com C# Dev Kit

### Setup do Banco de Dados Local

Usar Docker Compose para PostgreSQL:

```bash
# Subir PostgreSQL e pgAdmin
docker-compose up -d

# Verificar se está rodando
docker-compose ps

# Acessar pgAdmin em http://localhost:5050
# Email: admin@condominio.com
# Senha: admin
```

### Comandos Iniciais

**Opção 1: Usar script automatizado (Recomendado)**

```bash
# Clonar repositório
git clone https://github.com/rodrigosabreu/sistema-condominio-qr.git
cd sistema-condominio-qr

# Subir banco de dados
docker-compose up -d

# Rodar script de setup (Windows)
setup.bat

# Ou (Linux/Mac)
chmod +x setup.sh
./setup.sh
```

**Opção 2: Criar estrutura manualmente**

```bash
# Clonar repositório
git clone https://github.com/rodrigosabreu/sistema-condominio-qr.git
cd sistema-condominio-qr

# Subir banco de dados
docker-compose up -d

# Criar estrutura de projetos (seguindo AGENTS.md)
dotnet new sln -n SistemaCondominio
dotnet new webapi -n SistemaCondominio.Api -o backend/src/SistemaCondominio.Api
dotnet new classlib -n SistemaCondominio.Domain -o backend/src/SistemaCondominio.Domain
dotnet new classlib -n SistemaCondominio.Application -o backend/src/SistemaCondominio.Application
dotnet new classlib -n SistemaCondominio.Infrastructure -o backend/src/SistemaCondominio.Infrastructure
dotnet new classlib -n SistemaCondominio.Auth -o backend/src/SistemaCondominio.Auth

# Adicionar projetos à solução
dotnet sln add backend/src/SistemaCondominio.Api/SistemaCondominio.Api.csproj
dotnet sln add backend/src/SistemaCondominio.Domain/SistemaCondominio.Domain.csproj
dotnet sln add backend/src/SistemaCondominio.Application/SistemaCondominio.Application.csproj
dotnet sln add backend/src/SistemaCondominio.Infrastructure/SistemaCondominio.Infrastructure.csproj
dotnet sln add backend/src/SistemaCondominio.Auth/SistemaCondominio.Auth.csproj

# Adicionar referências entre projetos
dotnet add backend/src/SistemaCondominio.Api reference backend/src/SistemaCondominio.Application backend/src/SistemaCondominio.Auth
dotnet add backend/src/SistemaCondominio.Application reference backend/src/SistemaCondominio.Domain
dotnet add backend/src/SistemaCondominio.Infrastructure reference backend/src/SistemaCondominio.Domain
dotnet add backend/src/SistemaCondominio.Auth reference backend/src/SistemaCondominio.Domain

# Instalar pacotes NuGet
dotnet add backend/src/SistemaCondominio.Infrastructure package Microsoft.EntityFrameworkCore.Design
dotnet add backend/src/SistemaCondominio.Infrastructure package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add backend/src/SistemaCondominio.Infrastructure package QRCoder
dotnet add backend/src/SistemaCondominio.Api package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add backend/src/SistemaCondominio.Api package SendGrid.Extensions.DependencyInjection
dotnet add backend/src/SistemaCondominio.Api package Serilog.AspNetCore
dotnet add backend/src/SistemaCondominio.Application package FluentValidation

# Restaurar dependências
dotnet restore

# Criar e aplicar migrations (quando tiver o DbContext)
dotnet ef migrations add InitialCreate --project backend/src/SistemaCondominio.Infrastructure --startup-project backend/src/SistemaCondominio.Api
dotnet ef database update --project backend/src/SistemaCondominio.Infrastructure --startup-project backend/src/SistemaCondominio.Api

# Rodar API em desenvolvimento
dotnet run --project backend/src/SistemaCondominio.Api

# Rodar testes
dotnet test
```

### Configuração de Ambiente

1. **Configurar `appsettings.Development.json`:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=condominios;Username=postgres;Password=postgres"
  },
  "JwtSettings": {
    "Secret": "sua-chave-secreta-aqui-min-32-caracteres",
    "Issuer": "sistema-condominio",
    "Audience": "sistema-condominio-api",
    "ExpirationInMinutes": 480
  },
  "SendGrid": {
    "ApiKey": "sua-api-key-sendgrid",
    "FromEmail": "noreply@seudominio.com",
    "FromName": "Sistema de Condomínios"
  }
}
```

2. **Configurar JWT:**
- Gerar uma chave secreta de pelo menos 32 caracteres
- Usar em desenvolvimento (em produção usar variáveis de ambiente)

3. **Configurar SendGrid (opcional para desenvolvimento):**
- Criar conta gratuita no SendGrid
- Obter API Key
- Configurar em `appsettings.Development.json`

### Ferramentas de Desenvolvimento

- **Postman** ou **Insomnia** - Para testar endpoints da API
- **pgAdmin** - http://localhost:5050 (já incluído no docker-compose)
- **DBeaver** - Alternativa para gerenciar banco de dados

## Estrutura do projeto

```
sistema-condominio-qr/
├── backend/                 # API .NET 10 (Clean Architecture)
│   ├── SistemaCondominio.slnx
│   ├── .tools/              # dotnet-ef local
│   └── src/                 # Api, Domain, Application, Infrastructure, Auth
├── frontend/                # React + Vite + TypeScript + Tailwind
├── docker-compose.yml       # PostgreSQL 14 e pgAdmin
├── setup.sh / setup.bat     # Scripts históricos de criação da estrutura inicial
├── AGENTS.md                # Regras do sistema (permissões, segurança, padrões)
├── PROGRESSO.md             # Histórico de implementação
└── README.md
```

Comandos a partir da raiz do repositório:

```bash
dotnet build backend/SistemaCondominio.slnx                       # compila o backend
dotnet run --project backend/src/SistemaCondominio.Api            # roda a API (use ASPNETCORE_ENVIRONMENT=Development)
cd frontend && npm install && npm run dev                         # roda o front
```

## Frontend

Pasta `frontend/` (React 19 + Vite + TypeScript + Tailwind CSS). Em desenvolvimento, o Vite encaminha `/api` para a API em `http://localhost:5234`.

```bash
# Terminal 1 - API
ASPNETCORE_ENVIRONMENT=Development dotnet run --project backend/src/SistemaCondominio.Api --urls http://localhost:5234

# Terminal 2 - Front (http://localhost:5173)
cd frontend
npm install
npm run dev
```

Telas: login, painel, condomínios, locais (com QR Code em PNG para baixar), serviços (histórico, registro, edição e conclusão) e usuários (somente administradores). A página pública `/qr/{id}` é a que o morador vê ao escanear o QR, sem login.

As telas respeitam as regras de permissão do AGENTS.md apenas para mostrar ou esconder ações; a validação real é sempre do backend. O QR Code aponta para `QrCode:UrlBase` (padrão `http://localhost:5173/qr`).

## Endpoints da API

Rodar em desenvolvimento (aplica migrations e cria dados de exemplo na primeira execução):

```bash
ASPNETCORE_ENVIRONMENT=Development dotnet run --project backend/src/SistemaCondominio.Api --urls http://localhost:5234
```

Usuários de exemplo (senha: `Dev@12345`, definida em `Seed:SenhaPadrao`):

| E-mail | Papel |
|---|---|
| admin.geral@sistema.com | AdministradorGeral (acesso a todos os condomínios) |
| sindico@flores.com.br | AdministradorCondominio (Condomínio Flores) |
| zelador@flores.com.br | UsuarioComum (Condomínio Flores) |
| sindico@aurora.com.br | AdministradorCondominio (Condomínio Aurora) |

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/qrcode/{qrCodeId}` | Anônimo | Dados do local e últimos 20 serviços; incrementa visualizações e registra acesso |
| POST | `/api/auth/login` | Anônimo | Retorna JWT (`condominoId`, `usuarioId`, `papel`, `geral`) |
| GET | `/api/condominios` | Autenticado | Lista condomínios (Geral: todos; demais: o próprio) |
| POST | `/api/condominios` | Administrador Geral | Cadastra condomínio |
| PUT | `/api/condominios/{id}` | Geral, ou admin do próprio condomínio | Edita condomínio (só o Geral ativa/desativa) |
| GET | `/api/locais` | Autenticado | Locais ativos com QR Code do condomínio do usuário (todos, se geral) |
| GET | `/api/locais/{id}` | Administrador | Detalhe de um local do próprio condomínio |
| POST | `/api/locais` | Geral, ou admin do condomínio | Cadastra local e gera o QR Code automaticamente |
| PUT | `/api/locais/{id}` | Geral, ou admin do condomínio | Edita local (não permite mudar de condomínio) |
| GET | `/api/locais/{id}/qrcode` | Administrador | PNG do QR Code do local |
| GET | `/api/usuarios` | Administrador | Lista usuários (Geral: todos; admin: do próprio condomínio) |
| POST | `/api/usuarios` | Geral, ou admin do condomínio (só funcionários) | Cadastra usuário com senha |
| PUT | `/api/usuarios/{id}` | Geral, ou admin do condomínio (só funcionários do próprio) | Edita usuário; senha opcional |
| GET | `/api/servicos/por-local/{localId}?pagina=1&tamanho=20` | Autenticado | Status atual e histórico paginado |
| POST | `/api/servicos` | Autenticado | Registra serviço (status `agendado`) |
| PUT | `/api/servicos/{servicoId}` | Admin do condomínio, ou funcionário nos próprios serviços | Edita dados do serviço |
| PATCH | `/api/servicos/{servicoId}/concluir` | Admin do condomínio, ou funcionário nos próprios serviços | Conclui serviço |

Regras completas de permissão estão em AGENTS.md ("Regras de Cadastro e Edição"). Violações de escopo retornam 403.

O QR Code aponta para `QrCode:UrlBase/{qrCodeId}`. Configuração do JWT em `JwtSettings` (em produção, definir `JwtSettings__Secret` por variável de ambiente, com 32+ caracteres). Requisições são limitadas por usuário autenticado (ou por IP, para anônimos) em `RateLimiting`, respondendo 429 ao exceder.

Exemplos de requisições estão em `backend/src/SistemaCondominio.Api/SistemaCondominio.Api.http`.

## Requisitos de Qualidade

- QR Codes legíveis mesmo com logo do condomínio no centro
- Sistema 100% responsivo (mobile-first, tablet e desktop)
- Interface funciona em todos os tamanhos de tela (min: 320px)
- Botões interativos com tamanho mínimo de 48x48px para mobile
- Formulários otimizados para mobile (teclado numérico, autocomplete)
- Notificações por email para administradores
- Histórico de 12 meses acessível
- Logs de acesso mantidos por 90 dias
- Acessibilidade (leitores de tela, contraste de cores)
- Todo o código, endpoints e mensagens em português brasileiro
