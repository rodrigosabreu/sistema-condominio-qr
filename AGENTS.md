---
inclusion: auto
name: Sistema de Gestão de Condomínios com QR Codes
description: Guia para agentes que desenvolvem sistema de gerenciamento de condomínios com QR Codes para serviços e informações
---

# Agente: Sistema de Condomínios QR

## Propósito
Este agente auxilia no desenvolvimento de um sistema seguro para condomínios onde QR Codes em locais comuns permitem aos condôminos acessar informações sobre serviços, manutenções, interdições e outros eventos, com isolamento de dados baseado em papéis de acesso (moradores têm acesso público, usuários cadastrados têm isolamento por condomínio).

## Cenário de Uso
- QR Codes posicionados em locais do condomínio (banheiros, salões, churrasqueiras, jardins, hortas, etc.)
- Condôminos escaneiam QR Codes com smartphones
- Sistema exibe informações: serviço realizado (limpeza, manutenção, jardinagem), datas, responsáveis, status de interdição
- Histórico acessível via link único por QR Code

## Segurança (CRÍTICO)

### Isolamento por Papel (CRÍTICO)
- **Moradores (acesso anônimo)**: Não há isolamento por condomínio. Eles podem consultar QR Codes de **qualquer condomínio**. Apenas validamos que o QR Code existe no banco de dados.
- **Usuários cadastrados (funcionários/administradores)**: Validação obrigatória que o usuário só acessa dados do seu próprio condomínio (ou todos, se for Administrador Geral)

### Regras Gerais de Segurança
- **Validação de UUID**: IDs devem ser UUIDs válidos
- **Rate Limiting**: Proteção contra scraping e ataques de força bruta
- **Authentication Bearer Token**: JWT com scope limitado ao condomínio do usuário (apenas para endpoints autenticados)
- **Auditoria de Acesso**: Logs de todas as consultas para rastreamento (incluindo acessos anônimos de moradores)

## Estrutura do Sistema

### Componentes Principais
- **Gerador de QR Codes**: Sistema de geração de QR Codes únicos por local/serviço
- **API de Consulta Anônima**: Endpoint público para moradores `/api/qrcode/{qr_code_id}` (sem validação de escopo)
- **API de Consulta Autenticada**: Endpoints protegidos para funcionários/administradores com validação de escopo por condomínio
- **Dashboard Administrativo**: Gestão de locais, serviços e QR Codes (por condomínio)
- **Banco de Dados**: Armazenamento de locais, QR Codes, serviços e histórico
- **Gateway de Autenticação**: Validação de JWT e verificação de escopo do condomínio

### Tipos de Locais
- Banheiros (masculino/feminino)
- Salões de festas
- Churrasqueiras
- Áreas de lazer (quadra, playground)
- Jardins e áreas verdes
- Hortas comunitárias
- Garagens
- Outros (especificar no cadastro)

### Papéis e Permissões

O sistema tem duas categorias de acesso:

#### 1. Usuários Cadastrados (funcionários/administradores)
Precisam de cadastro para acessar o sistema (via JWT):

##### Administrador Geral (Super Admin)
- Acesso total a **todos os condomínios**
- Pode visualizar, editar e excluir qualquer dado do sistema
- Gerencia administradores de condomínio
- Acesso ao dashboard consolidado com dados de todos os condomínios

##### Administrador de Condomínio
- Acesso limitado ao **seu condomínio específico**
- Pode visualizar, editar e excluir todos os locais e serviços do condomínio
- Pode cadastrar novos funcionários/usuários do condomínio
- Recebe alertas e notificações do condomínio

##### Usuário Comum (Funcionário)
- Acesso limitado ao **seu condomínio**
- Pode **registrar novos serviços/eventos** (ex: concluir limpeza de banheiro)
- Pode visualizar apenas os dados do seu condomínio
- **Não pode editar ou excluir** eventos de outros usuários
- Pode apenas concluir serviços que criou

#### 2. Moradores (Acesso Livre - Sem Cadastro)
- **Não precisam de cadastro nem autenticação**
- Escaneiam QR Codes com o smartphone
- Apenas **visualizam** informações do local
- **Podem escanear QR Codes de qualquer condomínio** (sem validação de escopo)
- **Não podem** registrar serviços
- **Não têm acesso ao sistema diretamente** (apenas via link do QR Code)
- Acesso **anônimo e irrestrito** a informações públicas do local

### Tipos de Serviços/Eventos
- **Limpeza**: Frequência (diária, semanal, mensal), responsável, checklist
- **Manutenção**: Tipo (elétrica, hidráulica, estrutural), status (em andamento, concluído), previsão
- **Interdição**: Motivo, período, data de reabertura prevista
- **Manutenção preventiva**: Agendamento, verificação, relatório
- **Jardinagem/Horta**: Serviço realizado, plantio, colheita

## Stack Tecnológica

### Backend
- **Linguagem**: C# (.NET 8)
- **Framework**: ASP.NET Core Web API
- **Banco de Dados**: PostgreSQL
- **ORM**: Entity Framework Core

### Bibliotecas Principais
- **QR Code**: QRCoder (https://github.com/codebude/QRCoder)
- **JWT**: System.IdentityModel.Tokens.Jwt (Microsoft oficial)
- **Email**: SendGrid (SDK oficial: SendGrid.Extensions.DependencyInjection)
- **Validação**: FluentValidation
- **Logging**: Serilog
- **Testes**: xUnit + Moq

### Estrutura de Projeto
```
sistema-condominio-qr/
├── src/
│   ├── SistemaCondominio.Api/           # API (Controllers, Minimal APIs)
│   ├── SistemaCondominio.Domain/        # Entidades, Enums, Interfaces
│   ├── SistemaCondominio.Application/   # Services, DTOs, Validators
│   ├── SistemaCondominio.Infrastructure/# EF Core, Repositories, External Services
│   └── SistemaCondominio.Auth/          # JWT generation, Authentication
├── tests/
│   ├── SistemaCondominio.UnitTests/
│   └── SistemaCondominio.IntegrationTests/
├── docker-compose.yml                   # PostgreSQL + pgAdmin
├── .env.example
└── appsettings.json
```

### Comandos
- `dotnet restore` - Restaurar dependências
- `dotnet build` - Compilar projeto
- `dotnet run --project src/SistemaCondominio.Api` - Rodar API em desenvolvimento
- `dotnet test` - Rodar testes
- `dotnet ef migrations add <Nome>` - Criar migration
- `dotnet ef database update` - Aplicar migrations

### Configuração (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=condominios;Username=postgres;Password=senha"
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
  },
  "RateLimiting": {
    "PermitLimit": 100,
    "WindowInSeconds": 60
  }
}
```

### Padrões de Arquitetura
- **Clean Architecture**: Separação em Domain, Application, Infrastructure, API
- **Dependency Injection**: Injeção de dependências via DI container do .NET
- **Repository Pattern**: Repositórios para acesso a dados
- **DTO Pattern**: Data Transfer Objects para entrada/saída de API
- **Global Exception Handling**: Middleware para tratamento de erros
- **JWT Authentication**: Middleware de autenticação JWT
- **Rate Limiting**: Middleware para limitar requisições

## Padrões de Implementação

### Design de Banco de Dados
```sql
-- Tabela de Condomínios
condominios (
  id: UUID,
  nome: VARCHAR,
  cnpj: VARCHAR(14),
  endereco: TEXT,
  telefone: VARCHAR,
  ativo: BOOLEAN,
  criado_em: TIMESTAMP
)

-- Tabela de Papéis
papeis (
  id: UUID,
  nome: VARCHAR,
  descricao: TEXT,
  nivel_acesso: INTEGER,
  criado_em: TIMESTAMP
)

-- Tabela de Usuários
usuarios (
  id: UUID,
  condomino_id: UUID,
  nome: VARCHAR,
  email: VARCHAR,
  telefone: VARCHAR,
  unidade: VARCHAR,
  papel_id: UUID,
  ativo: BOOLEAN,
  criado_em: TIMESTAMP
)

-- Tabela de Locais
locais (
  id: UUID,
  condomino_id: UUID,
  nome: VARCHAR,
  tipo: ENUM('banheiro', 'salao', 'churrasqueira', 'lazer', 'jardim', 'horta', 'garagem', 'outro'),
  andar: INTEGER,
  coordenadas: POINT,
  qr_code_id: UUID,
  ativo: BOOLEAN
)

-- Tabela de Serviços/Eventos
servicos (
  id: UUID,
  local_id: UUID,
  usuario_id: UUID,
  tipo: ENUM('limpeza', 'manutencao', 'interdicao', 'preventiva', 'jardinagem', 'horta'),
  descricao: TEXT,
  status: ENUM('agendado', 'em_andamento', 'concluido', 'interrompido'),
  agendado_em: TIMESTAMP,
  concluido_em: TIMESTAMP,
  responsavel: VARCHAR,
  observacoes: TEXT,
  criado_em: TIMESTAMP
)

-- Tabela de QR Codes
qr_codes (
  id: UUID,
  local_id: UUID,
  codigo: VARCHAR(uniq),
  condomino_id: UUID,
  visualizacoes: INTEGER DEFAULT 0,
  ativo: BOOLEAN,
  criado_em: TIMESTAMP
)

-- Tabela de Auditoria de Acesso
registros_acesso (
  id: UUID,
  usuario_id: UUID, -- NULL se acesso anônimo (morador)
  qr_code_id: UUID,
  condomino_id: UUID,
  endpoint: VARCHAR,
  metodo: VARCHAR,
  codigo_resposta: INTEGER,
  ip_address: VARCHAR,
  user_agent: VARCHAR,
  anônimo: BOOLEAN DEFAULT true, -- true para moradores (sem cadastro), false para cadastrados
  criado_em: TIMESTAMP
)
```

### Padrão de URL para QR Codes
```
https://seudominio.com/qrcode/{qr_code_id}
```
O QR Code armazena apenas o ID único que aponta para o serviço/locak.atual

### Endpoint de Consulta Anônimo (Exemplo em C#)

```csharp
// API: GET /api/qrcode/{qr_code_id}
// Requer: Nenhum (acesso anônimo para moradores)
// Nota: Moradores podem escanear QR Codes de qualquer condomínio (sem validação de escopo)

[HttpGet("qrcode/{qrCodeId}")]
[AllowAnonymous]
public async Task<IActionResult> ObterPorQRCode(Guid qrCodeId, [FromServices] IQRCodeService qrCodeService)
{
    try
    {
        var resultado = await qrCodeService.ObterPorQRCodeAsync(qrCodeId);
        return Ok(resultado);
    }
    catch (NotFoundException ex)
    {
        return NotFound(new { erro = ex.Message });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Erro ao buscar QR Code");
        return StatusCode(500, new { erro = "Erro interno do servidor" });
    }
}

// Service Implementation
public async Task<QRCodeResponseDto> ObterPorQRCodeAsync(Guid qrCodeId)
{
    // 1. Validar UUID (já é Guid no parâmetro)
    // 2. Buscar QR Code
    var qrCode = await _qrCodeRepository.GetByIdAsync(qrCodeId);
    if (qrCode == null || !qrCode.Ativo)
        throw new NotFoundException("QR Code não encontrado");

    // 3. Incrementar visualizações
    qrCode.Visualizacoes++;
    await _qrCodeRepository.UpdateAsync(qrCode);

    // 4. Buscar local
    var local = await _localRepository.GetByIdAsync(qrCode.LocalId);
    if (local == null)
        throw new NotFoundException("Local não encontrado");

    // 5. Buscar condomínio
    var condominio = await _condominioRepository.GetByIdAsync(qrCode.CondominioId);

    // 6. Buscar serviços (últimos 20)
    var servicos = await _servicoRepository
        .GetByLocalIdAsync(local.Id, 20);

    // 7. Registrar acesso anônimo
    await _acessoRepository.RegistrarAcessoAsync(
        usuarioId: null,
        localId: local.Id,
        condominioId: qrCode.CondominioId,
        statusCode: 200,
        ipAddress: _httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString(),
        userAgent: _httpContextAccessor.HttpContext?.Request.Headers["User-Agent"].ToString(),
        anonimo: true
    );

    return new QRCodeResponseDto
    {
        Local = new LocalDto
        {
            Id = local.Id,
            Nome = local.Nome,
            Tipo = local.Tipo,
            QrCodeId = qrCode.Id,
            CondominioId = qrCode.CondominioId,
            CondominioNome = condominio?.Nome,
            Visualizacoes = qrCode.Visualizacoes
        },
        Servicos = servicos.Select(s => new ServicoDto
        {
            Id = s.Id,
            Tipo = s.Tipo,
            Descricao = s.Descricao,
            Status = s.Status,
            AgendadoEm = s.AgendadoEm,
            ConcluidoEm = s.ConcluidoEm,
            Responsavel = s.Responsavel,
            Observacoes = s.Observacoes
        }).ToList()
    };
}
```

### Estrutura de Resposta da API (Endpoint Anônimo)
```json
GET /api/qrcode/{qr_code_id}
{
  "local": {
    "id": "...",
    "nome": "Banheiro Masculino - 1º Andar",
    "tipo": "banheiro",
    "qrCodeId": "...",
    "condominoId": "...",
    "condominoNome": "Condomínio Residencial Flores",
    "visualizacoes": 45
  },
  "servicos": [
    {
      "id": "...",
      "tipo": "limpeza",
      "descricao": "Limpeza completa",
      "status": "concluido",
      "agendadoEm": "2026-10-25T08:00:00Z",
      "concluidoEm": "2026-10-25T10:30:00Z",
      "responsavel": "João Silva",
      "observacoes": "Limpeza de pisos e sanitários"
    }
  ]
}
```

### Estrutura de Resposta da API (Endpoint Autenticado)
```json
GET /api/servicos/por-local/{localId}?pagina=1&tamanho=20
{
  "local": {
    "id": "...",
    "nome": "Banheiro Masculino - 1º Andar",
    "tipo": "banheiro",
    "qrCodeId": "...",
    "condominoId": "..."
  },
  "statusAtual": {
    "ultimoServico": {
      "tipo": "limpeza",
      "concluidoEm": "2026-10-25T10:30:00Z",
      "responsavel": "João Silva"
    },
    "interrupcaoAtual": null,
    "proximoAgendado": {
      "tipo": "limpeza",
      "agendadoEm": "2026-10-26T08:00:00Z"
    }
  },
  "pagina": {
    "atual": 1,
    "tamanho": 20,
    "totalRegistros": 150,
    "totalPaginas": 8
  }
}
```

### Response em caso de tentativa indevida de acesso (endpoint autenticado)
```json
{
  "erro": "Acesso negado",
  "mensagem": "Este QR Code não pertence ao seu condomínio"
}
```

### Contagem de Visualizações
- Cada vez que um QR Code é escaneado, a contagem de `visualizacoes` é incrementada automaticamente
- A contagem é salva na tabela `qr_codes` (campo `visualizacoes`)
- A contagem é retornada na resposta da API para rastreamento de uso
- **Endpoint anônimo**: `GET /api/qrcode/{qr_code_id}` - sem autenticação (para moradores)
- **Endpoint autenticado**: `GET /api/servicos/por-local/{localId}` - com JWT (para admin/funcionários)
- Ambos os endpoints incrementam a contagem de visualizações

### Padrões de Paginação
- **Parâmetros de query**: `pagina` (número) e `tamanho` (número)
- **Valores padrão**: `pagina=1`, `tamanho=20`
- **Limite máximo**: `tamanho=100` (para prevenir abuso)
- **Validação**: Parâmetros devem ser números positivos
- **Resposta**: Inclui metadata de paginação (`pagina.atual`, `pagina.totalPaginas`, etc.)
- **Nota**: Paginação se aplica apenas a endpoints autenticados. Endpoint anônimo retorna fixo de 20 registros.

### Endpoint Autenticado para Consulta (Exemplo em C#)

```csharp
// API: GET /api/servicos/por-local/{localId}?pagina=1&tamanho=20
// Requer: Authorization: Bearer <token>
// Token deve conter: { condominoId, usuarioId, papel, geral }

[HttpGet("servicos/por-local/{localId}")]
[Authorize]
public async Task<IActionResult> ObterServicosPorLocal(
    Guid localId,
    [FromQuery] int pagina = 1,
    [FromQuery] int tamanho = 20,
    [FromServices] IServicoService servicoService)
{
    try
    {
        var tokenData = _jwtService.ObterDadosToken(HttpContext.User);
        var resultado = await servicoService.ObterPorLocalAsync(
            localId,
            pagina,
            tamanho,
            tokenData.CondominioId,
            tokenData.UsuarioId,
            tokenData.Geral
        );
        return Ok(resultado);
    }
    catch (ForbiddenException ex)
    {
        return StatusCode(403, new { erro = "Acesso negado", mensagem = ex.Message });
    }
    catch (NotFoundException ex)
    {
        return NotFound(new { erro = ex.Message });
    }
    catch (RateLimitExceededException)
    {
        return StatusCode(429, new { erro = "Limite de consultas excedido" });
    }
}

// Service Implementation
public async Task<ServicosPorLocalResponseDto> ObterPorLocalAsync(
    Guid localId,
    int pagina,
    int tamanho,
    Guid? condominioIdToken,
    Guid usuarioId,
    bool geral)
{
    // 1. Validar parâmetros de paginação
    if (pagina < 1) pagina = 1;
    if (tamanho < 1 || tamanho > 100) tamanho = 20;
    var offset = (pagina - 1) * tamanho;

    // 2. Buscar local
    var local = await _localRepository.GetByIdAsync(localId);
    if (local == null)
        throw new NotFoundException("Local não encontrado");

    // 3. Validar escopo de condomínio (CRÍTICO)
    if (!geral && local.CondominioId != condominioIdToken)
    {
        await _acessoRepository.RegistrarTentativaAcessoAsync(
            usuarioId, localId, condominioIdToken, 403);
        throw new ForbiddenException("Este local não pertence ao seu condomínio");
    }

    // 4. Verificar rate limiting
    if (_rateLimitService.IsRateLimited(usuarioId, condominioIdToken))
        throw new RateLimitExceededException();

    // 5. Buscar serviços com paginação
    var (servicos, total) = await _servicoRepository
        .GetByLocalIdPaginadoAsync(localId, tamanho, offset);

    // 6. Registrar acesso
    await _acessoRepository.RegistrarAcessoAsync(
        usuarioId, localId, local.CondominioId, 200);

    return new ServicosPorLocalResponseDto
    {
        Local = new LocalDto
        {
            Id = local.Id,
            Nome = local.Nome,
            Tipo = local.Tipo,
            QrCodeId = local.QrCodeId,
            CondominioId = local.CondominioId
        },
        StatusAtual = new StatusAtualDto
        {
            UltimoServico = servicos.FirstOrDefault() != null ? new ServicoResumoDto
            {
                Tipo = servicos.First().Tipo,
                ConcluidoEm = servicos.First().ConcluidoEm,
                Responsavel = servicos.First().Responsavel
            } : null,
            InterrupcaoAtual = null,
            ProximoAgendado = null
        },
        Pagina = new PaginacaoDto
        {
            Atual = pagina,
            Tamanho = tamanho,
            TotalRegistros = total,
            TotalPaginas = (int)Math.Ceiling((double)total / tamanho)
        }
    };
}
```

### Endpoint para Registrar Evento (Exemplo em C#)

```csharp
// API: POST /api/servicos
// Requer: Authorization: Bearer <token>
// Token deve conter: { condominoId, usuarioId, papel, geral }

[HttpPost("servicos")]
[Authorize]
public async Task<IActionResult> RegistrarServico(
    [FromBody] RegistrarServicoRequestDto request,
    [FromServices] IServicoService servicoService)
{
    try
    {
        var tokenData = _jwtService.ObterDadosToken(HttpContext.User);
        var resultado = await servicoService.RegistrarAsync(
            request,
            tokenData.CondominioId,
            tokenData.UsuarioId,
            tokenData.Geral
        );
        return StatusCode(201, resultado);
    }
    catch (ValidationException ex)
    {
        return BadRequest(new { erro = ex.Message });
    }
    catch (ForbiddenException ex)
    {
        return StatusCode(403, new { erro = "Acesso negado", mensagem = ex.Message });
    }
}

// DTO Request
public class RegistrarServicoRequestDto
{
    public Guid LocalId { get; set; }
    public TipoServico Tipo { get; set; }
    public string Descricao { get; set; }
    public string Responsavel { get; set; }
    public string Observacoes { get; set; }
}

// Service Implementation
public async Task<ServicoResponseDto> RegistrarAsync(
    RegistrarServicoRequestDto request,
    Guid? condominioIdToken,
    Guid usuarioId,
    bool geral)
{
    // 1. Validar dados de entrada (FluentValidation)
    var validationResult = await _validator.ValidateAsync(request);
    if (!validationResult.IsValid)
        throw new ValidationException(validationResult.Errors.First().ErrorMessage);

    // 2. Buscar local
    var local = await _localRepository.GetByIdAsync(request.LocalId);
    if (local == null)
        throw new NotFoundException("Local não encontrado");

    // 3. Validar escopo de condomínio
    if (!geral && local.CondominioId != condominioIdToken)
        throw new ForbiddenException("Este local não pertence ao seu condomínio");

    // 4. Verificar se usuário tem permissão
    var usuario = await _usuarioRepository.GetByIdAsync(usuarioId);
    if (usuario == null || !usuario.Ativo)
        throw new ForbiddenException("Usuário não autorizado");

    // 5. Criar serviço
    var novoServico = new Servico
    {
        Id = Guid.NewGuid(),
        LocalId = request.LocalId,
        UsuarioId = usuarioId,
        Tipo = request.Tipo,
        Descricao = request.Descricao,
        Responsavel = request.Responsavel,
        Observacoes = request.Observacoes,
        Status = StatusServico.Agendado,
        CriadoEm = DateTime.UtcNow
    };

    await _servicoRepository.AddAsync(novoServico);

    // 6. Registrar acesso
    await _acessoRepository.RegistrarAcessoAsync(
        usuarioId, local.Id, local.CondominioId, 201);

    // 7. Enviar notificações (background task)
    _ = Task.Run(() => _emailService.EnviarNotificacaoNovoServicoAsync(
        local.CondominioId,
        local.Nome,
        usuario.Nome,
        request.Tipo,
        request.Descricao,
        request.Responsavel
    ));

    return new ServicoResponseDto
    {
        Id = novoServico.Id,
        LocalId = novoServico.LocalId,
        Tipo = novoServico.Tipo,
        Descricao = novoServico.Descricao,
        Responsavel = novoServico.Responsavel,
        Status = novoServico.Status
    };
}
```

### Endpoint para Concluir Serviço (Exemplo em C#)

```csharp
// API: PATCH /api/servicos/{servicoId}/concluir
// Requer: Authorization: Bearer <token>
// Token deve conter: { condominoId, usuarioId, papel, geral }

[HttpPatch("servicos/{servicoId}/concluir")]
[Authorize]
public async Task<IActionResult> ConcluirServico(
    Guid servicoId,
    [FromBody] ConcluirServicoRequestDto request,
    [FromServices] IServicoService servicoService)
{
    try
    {
        var tokenData = _jwtService.ObterDadosToken(HttpContext.User);
        var resultado = await servicoService.ConcluirAsync(
            servicoId,
            request.Observacoes,
            tokenData.CondominioId,
            tokenData.UsuarioId,
            tokenData.Geral
        );
        return Ok(resultado);
    }
    catch (ForbiddenException ex)
    {
        return StatusCode(403, new { erro = "Acesso negado", mensagem = ex.Message });
    }
    catch (NotFoundException ex)
    {
        return NotFound(new { erro = ex.Message });
    }
}

// DTO Request
public class ConcluirServicoRequestDto
{
    public string Observacoes { get; set; }
}

// Service Implementation
public async Task<ServicoResponseDto> ConcluirAsync(
    Guid servicoId,
    string observacoes,
    Guid? condominioIdToken,
    Guid usuarioId,
    bool geral)
{
    // 1. Buscar serviço
    var servico = await _servicoRepository.GetByIdAsync(servicoId);
    if (servico == null)
        throw new NotFoundException("Serviço não encontrado");

    // 2. Verificar se serviço pertence ao condomínio do usuário
    var local = await _localRepository.GetByIdAsync(servico.LocalId);
    if (!geral && local.CondominioId != condominioIdToken)
        throw new ForbiddenException("Este serviço não pertence ao seu condomínio");

    // 3. Verificar se usuário é o responsável ou admin
    if (servico.UsuarioId != usuarioId && !geral)
        throw new ForbiddenException("Acesso negado");

    // 4. Atualizar serviço
    servico.Status = StatusServico.Concluido;
    servico.ConcluidoEm = DateTime.UtcNow;
    servico.Observacoes = observacoes;

    await _servicoRepository.UpdateAsync(servico);

    // 5. Enviar notificações (background task)
    _ = Task.Run(() => _emailService.EnviarNotificacaoServicoConcluidoAsync(
        local.CondominioId,
        local.Nome,
        usuarioId,
        servico.Tipo,
        servico.Descricao,
        servico.Responsavel,
        observacoes
    ));

    return new ServicoResponseDto
    {
        Id = servico.Id,
        LocalId = servico.LocalId,
        Tipo = servico.Tipo,
        Descricao = servico.Descricao,
        Responsavel = servico.Responsavel,
        Status = servico.Status,
        ConcluidoEm = servico.ConcluidoEm,
        Observacoes = servico.Observacoes
    };
}
```

## Requisitos de Qualidade
- QR Codes devem ser legíveis mesmo com logo do condomínio no centro
- Sistema 100% responsivo (mobile-first, tablet e desktop)
- Notificações por email para administradores
- Histórico de 12 meses acessível por histórico do local
- Logs de acesso mantidos por pelo menos 90 dias
- Interface deve funcionar em todos os tamanhos de tela (min: 320px)
- Botões e elementos interativos devem ter tamanho mínimo de 48x48px para mobile
- Formulários devem ser otimizados para mobile (teclado numérico para telefones, autocomplete)

## Integrações Sugeridas
- Sistema de gestão de moradores (API de cadastro)
- Plataforma de email (ex: SendGrid, Mailgun, Amazon SES)

## Observações
- O QR Code deve ser dinâmico para permitir atualização de conteúdo sem reimpresão
- Interface para moradores (apenas visualização) deve ser simples e rápida (sem login)
- Interface para funcionários/administradores (registro de serviços) requer login
- Acessibilidade (leitores de tela, contraste de cores)

### Isolamento de Dados (CRÍTICO)
- **Moradores (anônimos)**: Usam `/api/qrcode/{qr_code_id}`. **NÃO têm validação de condomínio**. Podem escanear QR Codes de qualquer condomínio.
- **Funcionários/Administradores (cadastrados)**: Usam `/api/servicos/por-local/{localId}`, `/api/servicos`, `/api/servicos/{servicoId}/concluir`. **Têm validação obrigatória de condomínio**.
- **Administrador Geral**: Tem acesso a todos os condomínios (chave `geral: true` no JWT).

### Segurança de Validação
- **NUNCA confie no ID do path** - sempre validar condomínio no token e no banco para operações de usuários cadastrados
- Moradores **não precisam** validar condomínio porque acessam QR Codes públicos (sem restrição)
- Implementar WAF (Web Application Firewall) para proteção contra ataques comuns
- Sanitizar todos os inputs e outputs para prevenir XSS
- Todos os nomes de variáveis, funções, endpoints e mensagens devem estar em português brasileiro
- URLs e endpoints devem usar nomes em português (ex: `/api/servicos`, `/api/condominios`, `/api/locais`)
- Mensagens de erro devem ser amigáveis e em português
- Validações de entrada devem ser claras e descritivas em português

### Schema do Token JWT
Todos os endpoints autenticados requerem um JWT Bearer token com o seguinte schema:

```json
{
  "condominoId": "UUID do condomínio do usuário",
  "usuarioId": "UUID do usuário autenticado",
  "papel": "administrador" | "funcionario",
  "geral": true | false
}
```

**Explicação dos campos:**
- `condominoId`: UUID do condomínio ao qual o usuário pertence (nulo para Super Admin)
- `usuarioId`: UUID do usuário autenticado
- `papel`: Papel do usuário ('administrador' ou 'funcionario')
- `geral`: Booleano indicando se é Super Admin (true = acesso total a todos condomínios, false = acesso limitado ao próprio condomínio)

## Papéis e Permissões Detalhadas

### Administrador Geral (Super Admin)
- **Nível de acesso**: 100
- Acesso total a **todos os condomínios**
- Pode visualizar, editar e excluir qualquer dado do sistema
- Gerencia administradores de condomínio
- Acesso ao dashboard consolidado com dados de todos os condomínios
- Token JWT: `{ condominoId: null, usuarioId: "...", papel: "administrador", geral: true }`

### Administrador de Condomínio
- **Nível de acesso**: 50 (por condomínio)
- Acesso limitado ao **seu condomínio específico**
- Pode visualizar, editar e excluir todos os locais e serviços do condomínio
- Pode cadastrar novos funcionários/usuários do condomínio
- Recebe alertas e notificações do condomínio
- Token JWT: `{ condominoId: "...", usuarioId: "...", papel: "administrador", geral: false }`

### Usuário Comum (Funcionário)
- **Nível de acesso**: 10 (por condomínio)
- Acesso limitado ao **seu condomínio**
- Pode **registrar novos serviços/eventos** (ex: concluir limpeza de banheiro)
- Pode visualizar apenas os dados do seu condomínio
- **Não pode editar ou excluir** eventos de outros usuários
- Pode apenas concluir serviços que criou
- Token JWT: `{ condominoId: "...", usuarioId: "...", papel: "funcionario", geral: false }`

## Segurança de Notificações

### Envio de Email por Evento
- A cada novo serviço registrado, todos os **administradores do mesmo condomínio** recebem notificação
- Ao concluir um serviço, todos os **administradores do mesmo condomínio** recebem notificação
- **Administradores de outros condomínios NÃO recebem notificações indevidas**

### Implementação Segura (C#)

```csharp
public class EmailService : IEmailService
{
    private readonly ISendGridClient _sendGridClient;
    private readonly IConfiguration _configuration;

    public async Task EnviarNotificacaoNovoServicoAsync(
        Guid condominioId,
        string localNome,
        string usuarioNome,
        TipoServico tipo,
        string descricao,
        string responsavel)
    {
        // CRÍTICO: Buscar administradores do condomínio do EVENTO (não do usuário)
        var administradores = await _usuarioRepository
            .GetAdministradoresPorCondominioAsync(condominioId);

        foreach (var admin in administradores)
        {
            var mensagem = new SendGridMessage
            {
                From = new EmailAddress(_configuration["SendGrid:FromEmail"],
                                       _configuration["SendGrid:FromName"]),
                Subject = $"Novo Serviço Registrado em {localNome}",
                PlainTextContent = $"O funcionário {usuarioNome} registrou um novo serviço em {localNome}:\n\n" +
                                  $"Tipo: {tipo}\n" +
                                  $"Descrição: {descricao}\n" +
                                  $"Responsável: {responsavel}\n\n" +
                                  $"Acesse o sistema para mais detalhes."
            };

            mensagem.AddTo(new EmailAddress(admin.Email, admin.Nome));

            await _sendGridClient.SendEmailAsync(mensagem);
        }
    }
}

// Repository Implementation
public async Task<List<Usuario>> GetAdministradoresPorCondominioAsync(Guid condominioId)
{
    return await _context.Usuarios
        .Where(u => u.CondominioId == condominioId
                && u.Ativo
                && u.Papel.NivelAcesso >= 50)  // Apenas administradores
        .Include(u => u.Papel)
        .ToListAsync();
}
```

### Pontos Críticos de Segurança
1. **NUNCA usar** `tokenData.CondominioId` para filtrar destinatários
2. **Sempre usar** `local.CondominioId` ou `servico.CondominioId` (do banco de dados)
3. Validar que o condomínio do evento pertence ao usuário autenticado antes de enviar
4. Logs de envio de email devem incluir `condomino_id` para auditoria
5. Sistema deve ter rate limiting por email para prevenir abuso

### Exemplo de Fluxo Seguro
1. Funcionário registra serviço no condomínio X
2. Sistema verifica que serviço pertence ao condomínio X
3. Sistema busca administradores do condomínio X (não de Y ou Z)
4. Emails enviados apenas para administradores de X
5. Registro de envio em `registros_acesso` com `condomino_id: X`