---
inclusion: auto
name: Sistema de Gestão de Condomínios com QR Codes
description: Guia para agentes que desenvolvem sistema de gerenciamento de condomínios com QR Codes para serviços e informações
---

# Agente: Sistema de Condomínios QR

## Propósito
Este agente auxilia no desenvolvimento de um sistema seguro para condomínios onde QR Codes em locais comuns permitem aos condôminos acessar informações sobre serviços, manutenções, interdições e outros eventos, com isolamento total de dados entre condomínios.

## Cenário de Uso
- QR Codes posicionados em locais do condomínio (banheiros, salões, churrasqueiras, jardins, hortas, etc.)
- Condôminos escaneiam QR Codes com smartphones
- Sistema exibe informações: serviço realizado (limpeza, manutenção, jardinagem), datas, responsáveis, status de interdição
- Histórico acessível via link único por QR Code

## Segurança (CRÍTICO)
- **Escopo por condomínio**: Cada condômino só acessa dados do seu próprio condomínio
- **Validação obrigatória**: Toda consulta deve verificar o condomínio do usuário autenticado
- **Prevenção de Horizontal Privilege Escalation**: Usuários não podem consultar QR Codes de outros condomínios
- **Rate Limiting**: Proteção contra scraping e ataques de força bruta
- **Authentication Bearer Token**: JWT com scope limitado ao condomínio do usuário
- **Validação de UUID**: IDs devem ser UUIDs válidos e pertencer ao condomínio autenticado
- **Auditoria de Acesso**: Logs de todas as consultas para rastreamento de tentativas indevidas

## Estrutura do Sistema

### Componentes Principais
- **Gerador de QR Codes**: Sistema de geração de QR Codes únicos por local/serviço
- **API de Consulta**: Endpoint REST para fetch de informações por QR Code ID (com validação de escopo)
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
Precisam de cadastro para acessar o sistema:

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
- Não precisam de cadastro
- Escaneiam QR Codes com o smartphone
- Apenas **visualizam** informações do local
- **Não podem** registrar serviços
- **Não podem** acessar o sistema diretamente (apenas por link do QR Code)

### Tipos de Serviços/Eventos
- **Limpeza**: Frequência (diária, semanal, mensal), responsável, checklist
- **Manutenção**: Tipo (elétrica, hidráulica, estrutural), status (em andamento, concluído), previsão
- **Interdição**: Motivo, período, data de reabertura prevista
- **Manutenção preventiva**: Agendamento, verificação, relatório
- **Jardinagem/Horta**: Serviço realizado, plantio, colheita

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
  usuario_id: UUID,
  qr_code_id: UUID,
  condomino_id: UUID,
  endpoint: VARCHAR,
  metodo: VARCHAR,
  codigo_resposta: INTEGER,
  ip_address: VARCHAR,
  user_agent: VARCHAR,
  criado_em: TIMESTAMP
)
```

### Padrão de URL para QR Codes
```
https://seudominio.com/qrcode/{qr_code_id}
```
O QR Code armazena apenas o ID único que aponta para o serviço/locak.atual

### Endpoint de Consulta Seguro (exemplo)

```javascript
// API: GET /api/servicos/por-local/{localId}?pagina=1&tamanho=20
// Requer: Authorization: Bearer <token>
// Token deve conter: { condominoId, usuarioId, funcao }

const obterServicosPorLocal = async (req, res) => {
  const { localId } = req.params;
  const { condominoId, usuarioId, funcao } = req.user; // do JWT
  const pagina = parseInt(req.query.pagina) || 1;
  const tamanho = parseInt(req.query.tamanho) || 20;
  const offset = (pagina - 1) * tamanho;

  // 1. Validar UUID
  if (!eUUIDValido(localId)) {
    return res.status(400).json({ erro: 'ID inválido' });
  }

  // 2. Buscar local e verificar condomínio
  const local = await db.consulta(
    'SELECT * FROM locais WHERE id = $1',
    [localId]
  );

  if (!local) {
    return res.status(404).json({ erro: 'Local não encontrado' });
  }

  // 3. Validar escopo de condomínio (CRÍTICO)
  if (local.condomino_id !== condominoId) {
    registrarTentativaAcesso(usuarioId, localId, condominoId, 403);
    return res.status(403).json({ 
      erro: 'Acesso negado',
      mensagem: 'Este QR Code não pertence ao seu condomínio'
    });
  }

  // 4. Verificar limite de consultas
  if (limiteConsultas.ehRateLimited(null, null)) {
    return res.status(429).json({ erro: 'Limite de consultas excedido' });
  }

  // 5. Incrementar contagem de visualizações do QR Code
  await db.consulta(
    'UPDATE qr_codes SET visualizacoes = visualizacoes + 1 WHERE id = $1',
    [local.qr_code_id]
  );

  // 6. Buscar dados do local com paginação (mais recentes primeiro)
  const servicos = await db.consulta(
    'SELECT * FROM servicos WHERE local_id = $1 ORDER BY criado_em DESC LIMIT $2 OFFSET $3',
    [localId, tamanho, offset]
  );

  // 7. Contar total de registros para paginação
  const totalRegistros = await db.consulta(
    'SELECT COUNT(*) FROM servicos WHERE local_id = $1',
    [localId]
  );

  res.json({
    local: {
      id: local.id,
      nome: local.nome,
      tipo: local.tipo,
      qrCodeId: local.qr_code_id,
      visualizacoes: local.visualizacoes || 0
    },
    servicos: servicos.map(s => ({
      id: s.id,
      tipo: s.tipo,
      descricao: s.descricao,
      status: s.status,
      agendadoEm: s.agendado_em,
      concluidoEm: s.concluido_em,
      responsavel: s.responsavel,
      observacoes: s.observacoes
    })),
    pagina: {
      atual: pagina,
      tamanho: tamanho,
      totalRegistros: totalRegistros[0].count,
      totalPaginas: Math.ceil(totalRegistros[0].count / tamanho)
    }
  });
};
```

### Estrutura de Resposta da API
```json
GET /api/servicos/por-local/{localId}
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
  }
}
```

### Response em caso de tentativa indevida de acesso
```json
{
  "erro": "Acesso negado",
  "mensagem": "Este QR Code não pertence ao seu condomínio"
}
```

### Response com paginação (sucesso)
```json
{
  "local": {
    "id": "...",
    "nome": "Banheiro Masculino - 1º Andar",
    "tipo": "banheiro",
    "qrCodeId": "...",
    "condominoId": "...",
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
  ],
  "pagina": {
    "atual": 1,
    "tamanho": 20,
    "totalRegistros": 150,
    "totalPaginas": 8
  }
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

### Endpoint para Registrar Evento (ex: concluir limpeza)

```javascript
// API: POST /api/servicos
// Requer: Authorization: Bearer <token>
// Token deve conter: { condominoId, usuarioId, funcao }

const registrarServico = async (req, res) => {
  const { localId, tipo, descricao, responsavel, observacoes } = req.body;
  const { condominoId, usuarioId } = req.user;

  // 1. Validar dados de entrada
  if (!localId || !tipo || !responsavel) {
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes' });
  }

  // 2. Validar UUID do local
  if (!eUUIDValido(localId)) {
    return res.status(400).json({ erro: 'ID do local inválido' });
  }

  // 3. Buscar local e verificar condomínio
  const local = await db.consulta(
    'SELECT * FROM locais WHERE id = $1',
    [localId]
  );

  if (!local) {
    return res.status(404).json({ erro: 'Local não encontrado' });
  }

  // 4. Validar escopo de condomínio
  if (local.condomino_id !== condominoId) {
    return res.status(403).json({ 
      erro: 'Acesso negado',
      mensagem: 'Este local não pertence ao seu condomínio'
    });
  }

  // 5. Verificar se usuário tem permissão para registrar (usuário comum ou admin)
  const usuario = await db.consulta(
    'SELECT * FROM usuarios WHERE id = $1',
    [usuarioId]
  );

  if (!usuario || usuario[0].ativo === false) {
    return res.status(403).json({ erro: 'Usuário não autorizado' });
  }

  // 6. Insert do serviço
  const novoServico = await db.consulta(
    `INSERT INTO servicos (local_id, usuario_id, tipo, descricao, responsavel, observacoes, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'agendado')
     RETURNING *`,
    [localId, usuarioId, tipo, descricao, responsavel, observacoes]
  );

  registrarAcesso(usuarioId, localId, condominoId, 201);

  // 7. Enviar notificação por email para administradores do condomínio
  try {
    const administradores = await db.consulta(
      `SELECT u.email, u.nome 
       FROM usuarios u 
       WHERE u.condomino_id = $1 
       AND u.ativo = true 
       AND EXISTS (
         SELECT 1 FROM papeis p 
         WHERE p.id = u.papel_id 
         AND p.nivel_acesso >= 50
       )`,
      [condominoId]
    );

    for (const admin of administradores) {
      await enviarEmail({
        para: admin.email,
        assunto: `Novo Serviço Registrado em ${local.nome}`,
        corpo: `O funcionário ${usuario.nome} registrou um novo serviço em ${local.nome}:\n\n` +
               `Tipo: ${tipo}\n` +
               `Descrição: ${descricao}\n` +
               `Responsável: ${responsavel}\n` +
               `\nAcesse o sistema para mais detalhes.`
      });
    }
  } catch (erroEmail) {
    console.error('Falha ao enviar notificações:', erroEmail);
    // Não falhar o request por erro de email
  }

  res.status(201).json({
    mensagem: 'Serviço registrado com sucesso',
    servico: {
      id: novoServico[0].id,
      localId: novoServico[0].local_id,
      tipo: novoServico[0].tipo,
      descricao: novoServico[0].descricao,
      responsavel: novoServico[0].responsavel,
      status: novoServico[0].status
    }
  });
};
```

### Endpoint para Concluir Serviço (Função do Funcionário)

```javascript
// API: PATCH /api/servicos/{servicoId}/concluir
// Requer: Authorization: Bearer <token>

const concluirServico = async (req, res) => {
  const { servicoId } = req.params;
  const { usuarioId, condominoId } = req.user;
  const { observacoes } = req.body;

  // 1. Buscar serviço
  const servico = await db.consulta(
    'SELECT * FROM servicos WHERE id = $1',
    [servicoId]
  );

  if (!servico) {
    return res.status(404).json({ erro: 'Serviço não encontrado' });
  }

  // 2. Verificar se serviço pertence ao condomínio do usuário
  const local = await db.consulta(
    'SELECT condomino_id FROM locais WHERE id = $1',
    [servico[0].local_id]
  );

  if (local[0].condomino_id !== condominoId) {
    return res.status(403).json({ 
      erro: 'Acesso negado',
      mensagem: 'Este serviço não pertence ao seu condomínio'
    });
  }

  // 3. Verificar se usuário é o responsável ou admin
  if (servico[0].usuario_id !== usuarioId && !ehAdmin(condominoId, usuarioId)) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }

  // 4. Atualizar serviço
  const servicoAtualizado = await db.consulta(
    `UPDATE servicos SET status = 'concluido', concluido_em = NOW(), observacoes = $1
     WHERE id = $2 RETURNING *`,
    [observacoes, servicoId]
  );

  // 5. Enviar notificação para administradores do condomínio
  try {
    const administradores = await db.consulta(
      `SELECT u.email, u.nome 
       FROM usuarios u 
       WHERE u.condomino_id = $1 
       AND u.ativo = true 
       AND EXISTS (
         SELECT 1 FROM papeis p 
         WHERE p.id = u.papel_id 
         AND p.nivel_acesso >= 50
       )`,
      [condominoId]
    );

    const localInfo = await db.consulta(
      'SELECT nome, condomino_id FROM locais WHERE id = $1',
      [servicoAtualizado[0].local_id]
    );

    const usuarioInfo = await db.consulta(
      'SELECT nome FROM usuarios WHERE id = $1',
      [usuarioId]
    );

    for (const admin of administradores) {
      await enviarEmail({
        para: admin.email,
        assunto: `Serviço Concluído em ${localInfo[0].nome}`,
        corpo: `O funcionário ${usuarioInfo[0].nome} concluiu o serviço em ${localInfo[0].nome}:\n\n` +
               `Tipo: ${servicoAtualizado[0].tipo}\n` +
               `Descrição: ${servicoAtualizado[0].descricao}\n` +
               `Responsável: ${servicoAtualizado[0].responsavel}\n` +
               `Observações: ${observacoes}\n` +
               `\nAcesse o sistema para mais detalhes.`
      });
    }
  } catch (erroEmail) {
    console.error('Falha ao enviar notificações de conclusão:', erroEmail);
    // Não falhar o request por erro de email
  }

  res.json({
    mensagem: 'Serviço concluído com sucesso',
    servico: servicoAtualizado[0]
  });
};
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
- **NUNCA confie no ID do path** - sempre validar condomínio no token e no banco para operações protegidas
- Implementar WAF (Web Application Firewall) para proteção contra ataques comuns
- Sanitizar todos os inputs e outputs para prevenir XSS
- Todos os nomes de variáveis, funções, endpoints e mensagens devem estar em português brasileiro
- URLs e endpoints devem usar nomes em português (ex: `/api/servicos`, `/api/condominios`, `/api/locais`)
- Mensagens de erro devem ser amigáveis e em português
- Validações de entrada devem ser claras e descritivas em português

## Papéis e Permissões Detalhadas

### Administrador Geral (Super Admin)
- **Nível de acesso**: 100
- Acesso total a **todos os condomínios**
- Pode visualizar, editar e excluir qualquer dado do sistema
- Gerencia administradores de condomínio
- Acesso ao dashboard consolidado com dados de todos os condomínios
- Token JWT deve conter `geral: true`

### Administrador de Condomínio
- **Nível de acesso**: 50 (por condomínio)
- Acesso limitado ao **seu condomínio específico**
- Pode visualizar, editar e excluir todos os locais e serviços do condomínio
- Pode cadastrar novos funcionários/usuários do condomínio
- Recebe alertas e notificações do condomínio
- Token JWT deve conter `condominoId` e `papel: 'administrador'`

### Usuário Comum (Funcionário)
- **Nível de acesso**: 10 (por condomínio)
- Acesso limitado ao **seu condomínio**
- Pode **registrar novos serviços/eventos** (ex: concluir limpeza de banheiro)
- Pode visualizar apenas os dados do seu condomínio
- **Não pode editar ou excluir** eventos de outros usuários
- Pode apenas concluir serviços que criou
- Token JWT deve conter `condominoId` e `papel: 'funcionario'`

## Segurança de Notificações

### Envio de Email por Evento
- A cada novo serviço registrado, todos os **administradores do mesmo condomínio** recebem notificação
- Ao concluir um serviço, todos os **administradores do mesmo condomínio** recebem notificação
- **Administradores de outros condomínios NÃO recebem notificações indevidas**

### Implementação Segura
```javascript
const administradores = await db.consulta(
  `SELECT u.email, u.nome 
   FROM usuarios u 
   WHERE u.condomino_id = $1  -- Filtro por condomínio do evento
   AND u.ativo = true 
   AND EXISTS (
     SELECT 1 FROM papeis p 
     WHERE p.id = u.papel_id 
     AND p.nivel_acesso >= 50  -- Apenas administradores
   )`,
  [condominoId]  // O condomínio do evento, nunca o do usuário autenticado
);
```

### Pontos Críticos de Segurança
1. **NUNCA usar** `req.user.condominoId` para filtrar destinatários
2. **Sempre usar** `local.condomino_id` ou `servico.condomino_id` (do banco de dados)
3. Validar que o condomínio do evento pertence ao usuário autenticado antes de enviar
4. Logs de envio de email devem incluir `condomino_id` para auditoria
5. Sistema deve ter rate limiting por email para prevenir abuso

### Exemplo de Fluxo Seguro
1. Funcionário registra serviço no condomínio X
2. Sistema verifica que serviço pertence ao condomínio X
3. Sistema busca administradores do condomínio X (não de Y ou Z)
4. Emails enviados apenas para administradores de X
5. Registro de envio em `registros_acesso` com `condomino_id: X`