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
- PostgreSQL 14+
- Docker (opcional, para banco de dados local)

### Comandos Iniciais
```bash
# Clonar repositório
git clone https://github.com/rodrigosabreu/sistema-condominio-qr.git
cd sistema-condominio-qr

# Restaurar dependências
dotnet restore

# Criar e aplicar migrations (quando implementado)
dotnet ef migrations add InitialCreate
dotnet ef database update

# Rodar API em desenvolvimento
dotnet run --project src/SistemaCondominio.Api

# Rodar testes
dotnet test
```

### Configuração de Ambiente
1. Copiar `appsettings.json` para `appsettings.Development.json`
2. Configurar string de conexão do PostgreSQL
3. Configurar chave secreta para JWT
4. Configurar API key do SendGrid

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
