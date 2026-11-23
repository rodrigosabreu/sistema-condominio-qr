# Plano de Regressão — FluentValidation

**Projeto**: sistema-condominio-qr
**Autor**: QA (Sentinel)
**Data**: 2026-11-22
**Referência**: Commit e8a9b0bfc1a0eb82c0f7adc50f53f8e6e4cff0c7
**Artefatos base**: AGENTS.md, PROGRESSO.md, DISCOVERY-FluentValidation.md, PROPOSTA-FluentValidation.md, RESOLUCAO-BLOQUEADORES-FluentValidation.md, HANDOFF-FluentValidation.md, código real (Dtos.cs, Validacao.cs, Services, TratamentoExcecoes, Endpoints, frontend/cliente.ts)

---

## 1. Endpoints e Fluxos Afetados

### 1.1 Endpoints de Mutação (Cobertos pela Discovery)

| Endpoint | Método | DTO de Entrada | Service | Validações Atuais (Validacao.cs) |
|----------|--------|----------------|---------|-----------------------------------|
| `/api/condominios` | POST | `CondominioRequest` | `CondominioService.CriarAsync` | Nome (obrig, 200), CNPJ (14 dígitos), Endereço (opc, 500), Telefone (opc, 20) |
| `/api/condominios/{id}` | PUT | `CondominioRequest` | `CondominioService.AtualizarAsync` | Nome (obrig, 200), CNPJ (14 dígitos), Endereço (opc, 500), Telefone (opc, 20) |
| `/api/locais` | POST | `LocalRequest` | `LocalService.CriarAsync` | Nome (obrig, 200), Tipo (enum), Andar (opc), CondominioId (resolvido) |
| `/api/locais/{id}` | PUT | `LocalRequest` | `LocalService.AtualizarAsync` | Nome (obrig, 200), Tipo (enum), Andar (opc) |
| `/api/usuarios` | POST | `UsuarioRequest` | `UsuarioService.CriarAsync` | Nome (obrig, 200), Email (obrig, 255, regex, lowercase, único), Senha (obrig, min 8), Papel (enum), Telefone (opc, 20), Unidade (opc, 50), CondominioId (resolvido) |
| `/api/usuarios/{id}` | PUT | `UsuarioRequest` | `UsuarioService.AtualizarAsync` | Nome (obrig, 200), Email (obrig, 255, regex, lowercase, único), Senha (opc, min 8 se informada), Papel (enum), Telefone (opc, 20), Unidade (opc, 50) |
| `/api/servicos` | POST | `RegistrarServicoRequest` | `ServicoService.RegistrarAsync` | Descrição (obrig, 1000), Responsável (opc, 200), Observações (opc), LocalId (existente), Tipo (enum) |
| `/api/servicos/{id}` | PUT | `AtualizarServicoRequest` | `ServicoService.AtualizarAsync` | Descrição (obrig, 1000), Responsável (opc, 200), Observações (opc, 2000), Tipo (enum), AgendadoEm (opc) |
| `/api/servicos/{id}/concluir` | PATCH | `ConcluirServicoRequest` | `ServicoService.ConcluirAsync` | Observações (opc) |
| `/api/auth/login` | POST | `LoginRequest` | `AutenticacaoService.LoginAsync` | Email (trim, lowercase), Senha (sem trim) |

### 1.2 Endpoints de Consulta (Não Afetados Diretamente — Validação de Path/Query Apenas)

| Endpoint | Método | Validações |
|----------|--------|------------|
| `/api/qrcode/{qrCodeId}` | GET | UUID válido, QR Code ativo |
| `/api/locais` | GET | Paginação (pagina≥1, tamanho 1-100), escopo |
| `/api/servicos/por-local/{localId}` | GET | UUID, escopo, paginação |
| `/api/condominios` | GET | Escopo |
| `/api/usuarios` | GET | Escopo, admin |

### 1.3 Fluxos Críticos de Precedência (Ordem de Verificação)

| Service | Ordem Atual (Crítica) |
|---------|----------------------|
| `CondominioService.CriarAsync` | 1. Papel (Admin Geral) → 2. Validação entrada |
| `CondominioService.AtualizarAsync` | 1. Papel (Admin) → 2. Existência recurso → 3. Escopo → 4. Regra ativação → 5. Validação entrada |
| `LocalService.CriarAsync` | 1. Papel (Admin) → 2. Condomínio existe → 3. Validação entrada |
| `LocalService.AtualizarAsync` | 1. Papel (Admin) → 2. Existência → 3. Escopo → 4. Regra mover condomínio → 5. Validação entrada |
| `UsuarioService.CriarAsync` | 1. Papel (Admin) → 2. Permissão resolve → 3. Email único → 4. Validação entrada |
| `ServicoService.RegistrarAsync` | 1. Validação descrição (bruta) → 2. Local existe → 3. Escopo → 4. Usuário ativo |
| `ServicoService.AtualizarAsync` | 1. Existência → 2. Escopo → 3. Permissão editar próprio → 4. Validação entrada |
| `AutenticacaoService.LoginAsync` | 1. Normalização email → 2. Busca usuário → 3. Verifica ativo/senha |

---

## 2. Comportamentos Atuais de Validação e Normalização

### 2.1 Validacao.cs (Fonte da Verdade)

| Método | Normalização | Regras | Exceção | Mensagem Atual |
|--------|--------------|--------|---------|----------------|
| `Obrigatorio(valor, campo, maximo)` | `Trim()` → vazio → `null` | Obrigatório, max length | `ValidacaoException` | `"{campo} é obrigatório"` / `"{campo} deve ter no máximo {maximo} caracteres"` |
| `Opcional(valor, campo, maximo)` | `Trim()` → vazio → `null` | Max length se informado | `ValidacaoException` | `"{campo} deve ter no máximo {maximo} caracteres"` |
| `Cnpj(valor)` | Extrai dígitos (`char.IsDigit`) | 14 dígitos se informado | `ValidacaoException` | `"CNPJ deve conter 14 dígitos"` |
| `Email(valor)` | `Obrigatorio` + `ToLowerInvariant()` | Regex `^[^@\s]+@[^@\s]+\.[^@\s]+$` | `ValidacaoException` | `"E-mail inválido"` |
| `Senha(valor)` | **Sem trim** | Min 8 chars | `ValidacaoException` | `"A senha deve ter no mínimo 8 caracteres"` |

### 2.2 Validações Adicionais nos Services (Fora de Validacao.cs)

| Service | Validação | Mensagem |
|---------|-----------|----------|
| `ServicoService.RegistrarAsync` | Descrição obrigatória, max 1000; Responsável max 200 | "A descrição do serviço é obrigatória" / "A descrição deve ter no máximo 1000 caracteres" / "O responsável deve ter no máximo 200 caracteres" |
| `ServicoService.AtualizarAsync` | Descrição obrigatória (max 1000), Responsável max 200, Observações max 2000 | Via `Validacao.Obrigatorio/Opcional` |
| `AutenticacaoService.LoginAsync` | Email trim + lowercase; senha sem trim; 401 se inválido | "E-mail ou senha inválidos" |
| `ServicoService.ConcluirAsync` | Status não concluído; dono ou admin | "Este serviço já foi concluído" / "Você só pode concluir serviços que você registrou" |

### 2.3 Binding de Enum (TipoServico)

- **Comportamento nativo ASP.NET Core**: Rejeita valores fora do enum (string ou numérico) → 400 automático
- **Valores válidos**: `Limpeza`, `Manutencao`, `Interdicao`, `Preventiva`, `Jardinagem`, `Horta`
- **Mensagem padrão do framework** (não customizada)

### 2.4 Tratamento de Exceções (TratamentoExcecoes.cs)

| Exceção | Status | Envelope |
|---------|--------|----------|
| `NaoEncontradoException` | 404 | `{ "erro": "Não encontrado", "mensagem": "<msg>" }` |
| `ValidacaoException` / `BadHttpRequestException` | 400 | `{ "erro": "Dados inválidos", "mensagem": "<msg>" }` |
| `NaoAutorizadoException` | 401 | `{ "erro": "Não autorizado", "mensagem": "<msg>" }` |
| `AcessoNegadoException` | 403 | `{ "erro": "Acesso negado", "mensagem": "<msg>" }` |
| Outros | 500 | `{ "erro": "Erro interno do servidor", "mensagem": "Erro interno do servidor" }` |

### 2.5 Consumidor Frontend (cliente.ts:66-78)

- Lê `corpo.mensagem` → `corpo.erro` → fallback
- **Consome apenas primeiro erro** (string única)
- Não consome array `errors`

---

## 3. Matriz de Testes

### 3.1 Legenda

- **TC-ID**: Identificador único do caso de teste
- **Endpoint**: Rota testada
- **Cenário**: Descrição do cenário
- **Pré-condição**: Estado necessário
- **Input**: Payload de entrada
- **Resultado Esperado**: Status, envelope, mensagem
- **Critério**: CA/RF/RNF relacionado
- **Evidência**: O que capturar (response JSON, logs, DB)

---

### 3.2 Testes de Validação de Entrada (DTOs)

#### CondominioRequest (POST /api/condominios, PUT /api/condominios/{id})

| TC-ID | Cenário | Pré-condição | Input | Resultado Esperado | Critério |
|-------|---------|--------------|-------|-------------------|----------|
| TC-CON-01 | Nome ausente | Admin Geral autenticado | `{ "nome": "", "cnpj": "12345678901234" }` | 400, `erro: "Dados inválidos"`, `mensagem: "Nome do condomínio é obrigatório"` | CA04, RF02 |
| TC-CON-02 | Nome > 200 chars | Admin Geral | `{ "nome": "A"*201, "cnpj": "12345678901234" }` | 400, `mensagem: "Nome do condomínio deve ter no máximo 200 caracteres"` | RF02 |
| TC-CON-03 | CNPJ 13 dígitos | Admin Geral | `{ "nome": "Teste", "cnpj": "1234567890123" }` | 400, `mensagem: "CNPJ deve conter 14 dígitos"` | CA01, RF02 |
| TC-CON-04 | CNPJ com letras/pontuação | Admin Geral | `{ "nome": "Teste", "cnpj": "12.345.678/0001-XX" }` | 400, `mensagem: "CNPJ deve conter 14 dígitos"` (após extração falha) | CA01 |
| TC-CON-04b | CNPJ 14 dígitos válido | Admin Geral | `{ "nome": "Teste", "cnpj": "12345678901234" }` | 201/200, CNPJ normalizado para dígitos | RF02 |
| TC-CON-05 | CNPJ vazio/null | Admin Geral | `{ "nome": "Teste", "cnpj": null }` | 201/200, CNPJ null (opcional) | RF02 |
| TC-CON-06 | Endereço > 500 chars | Admin Geral | `{ "nome": "Teste", "endereco": "A"*501 }` | 400, `mensagem: "Endereço deve ter no máximo 500 caracteres"` | RF02 |
| TC-CON-07 | Telefone > 20 chars | Admin Geral | `{ "nome": "Teste", "telefone": "1"*21 }` | 400, `mensagem: "Telefone deve ter no máximo 20 caracteres"` | RF02 |
| TC-CON-08 | Múltiplos erros (nome vazio + CNPJ inválido) | Admin Geral | `{ "nome": "", "cnpj": "123" }` | 400, **primeiro erro** no envelope (`"Nome do condomínio é obrigatório"`); todos logados internamente | CA07 (Should), RF02 |
| TC-CON-09 | Trim automático | Admin Geral | `{ "nome": "  Teste  ", "cnpj": " 12345678901234 " }` | 201/200, nome "Teste", CNPJ "12345678901234" | Normalização |

#### LocalRequest (POST /api/locais, PUT /api/locais/{id})

| TC-ID | Cenário | Pré-condição | Input | Resultado Esperado | Critério |
|-------|---------|--------------|-------|-------------------|----------|
| TC-LOC-01 | Nome ausente | Admin autenticado | `{ "nome": "", "tipo": "Banheiro", "condominioId": "<valid-uuid>" }` | 400, `mensagem: "Nome do local é obrigatório"` | CA04 |
| TC-LOC-02 | Nome > 200 chars | Admin | `{ "nome": "A"*201, ... }` | 400, `mensagem: "Nome do local deve ter no máximo 200 caracteres"` | RF02 |
| TC-LOC-03 | Tipo inválido (string) | Admin | `{ "nome": "Teste", "tipo": "Invalido", ... }` | 400 (binding enum) | Binding nativo |
| TC-LOC-04 | Tipo inválido (numérico fora do range) | Admin | `{ "nome": "Teste", "tipo": 999, ... }` | 400 (binding enum) | Binding nativo |
| TC-LOC-05 | Mover para outro condomínio (PUT) | Admin condomínio A | `{ "condominioId": "<uuid-cond-B>", ... }` | 400, `mensagem: "Não é possível mover o local para outro condomínio"` | Regra negócio |
| TC-LOC-06 | CondominioId inexistente (POST) | Admin | `{ "condominioId": "<uuid-inexistente>", ... }` | 404, `mensagem: "Condomínio não encontrado"` | Regra negócio |

#### UsuarioRequest (POST /api/usuarios, PUT /api/usuarios/{id})

| TC-ID | Cenário | Pré-condição | Input | Resultado Esperado | Critério |
|-------|---------|--------------|-------|-------------------|----------|
| TC-USR-01 | Nome ausente | Admin | `{ "nome": "", "email": "a@b.com", "senha": "12345678" }` | 400, `mensagem: "Nome é obrigatório"` | CA04 (contexto usuário) |
| TC-USR-02 | Email ausente | Admin | `{ "nome": "Teste", "email": "", "senha": "12345678" }` | 400, `mensagem: "E-mail é obrigatório"` | CA02 |
| TC-USR-03 | Email formato inválido | Admin | `{ "email": "invalido", "senha": "12345678" }` | 400, `mensagem: "E-mail inválido"` | CA02 |
| TC-USR-04 | Email duplicado (create) | Admin, email existente | `{ "email": "existente@test.com", "senha": "12345678" }` | 400, `mensagem: "Já existe um usuário com este e-mail"` | Regra negócio |
| TC-USR-05 | Email duplicado (update mesmo user) | Admin, mesmo email | `{ "email": "mesmo@test.com", "senha": "12345678" }` | 200 (ignora próprio) | Regra negócio |
| TC-USR-06 | Email duplicado (update outro user) | Admin, email de outro | `{ "email": "outro@test.com", "senha": "12345678" }` | 400, `mensagem: "Já existe um usuário com este e-mail"` | Regra negócio |
| TC-USR-07 | Senha 6 chars (create) | Admin | `{ "senha": "123456" }` | 400, `mensagem: "A senha deve ter no mínimo 8 caracteres"` | CA03 |
| TC-USR-08 | Senha 6 chars (update) | Admin, user existente | `{ "senha": "123456" }` | 400, `mensagem: "A senha deve ter no mínimo 8 caracteres"` | CA03 |
| TC-USR-09 | Senha ausente (create) | Admin | `{ "senha": null }` | 400, `mensagem: "A senha deve ter no mínimo 8 caracteres"` | CA03 |
| TC-USR-09b | Senha ausente (update) | Admin | `{ "senha": null }` | 200 (mantém senha atual) | Regra negócio |
| TC-USR-10 | Senha com espaços | Admin | `{ "senha": "  minha senha  " }` | 201/200, **preserva espaços** (sem trim) | Normalização |
| TC-USR-11 | Email uppercase → lowercase | Admin | `{ "email": "USUARIO@TEST.COM" }` | 201/200, email normalizado para `usuario@test.com` | Normalização |
| TC-USR-12 | Papel inválido (string) | Admin Geral | `{ "papel": "Invalido" }` | 400 (binding enum) | Binding nativo |
| TC-USR-13 | Admin condomínio tenta criar admin | Admin condomínio | `{ "papel": "AdministradorGeral" }` | 403, `mensagem: "Administradores de condomínio só podem cadastrar ou editar funcionários"` | Regra permissão |
| TC-USR-14 | Admin condomínio edita admin | Admin condomínio | PUT user admin | 403, `mensagem: "Administradores de condomínio só podem editar funcionários"` | Regra permissão |
| TC-USR-15 | Múltiplos erros (nome vazio + email inválido + senha curta) | Admin | `{ "nome": "", "email": "inv", "senha": "123" }` | 400, **primeiro erro**; todos logados | CA07 (Should) |

#### RegistrarServicoRequest (POST /api/servicos)

| TC-ID | Cenário | Pré-condição | Input | Resultado Esperado | Critério |
|-------|---------|--------------|-------|-------------------|----------|
| TC-SRV-01 | Descrição ausente | Funcionário autenticado | `{ "descricao": "", "localId": "<uuid>", "tipo": "Limpeza" }` | 400, `mensagem: "A descrição do serviço é obrigatória"` | RF02 |
| TC-SRV-02 | Descrição > 1000 | Funcionário | `{ "descricao": "A"*1001, ... }` | 400, `mensagem: "A descrição deve ter no máximo 1000 caracteres"` | RF02 |
| TC-SRV-03 | Responsável > 200 | Funcionário | `{ "responsavel": "A"*201, ... }` | 400, `mensagem: "O responsável deve ter no máximo 200 caracteres"` | RF02 |
| TC-SRV-04 | LocalId inexistente | Funcionário | `{ "localId": "<uuid-inexistente>", ... }` | 404, `mensagem: "Local não encontrado"` | Regra negócio |
| TC-SRV-05 | Local de outro condomínio | Funcionário condomínio A | `{ "localId": "<uuid-cond-B>", ... }` | 403, `mensagem: "Este local não pertence ao seu condomínio"` | Escopo |
| TC-SRV-06 | Tipo inválido (string) | Funcionário | `{ "tipo": "Invalido", ... }` | 400 (binding enum) | Binding nativo |
| TC-SRV-07 | Observações longas | Funcionário | `{ "observacoes": "A"*2001, ... }` | 201 (sem validação max no create) | Regra atual |
| TC-SRV-08 | Usuário inativo | User inativo | POST com token user inativo | 403, `mensagem: "Usuário não autorizado"` | Regra negócio |

#### AtualizarServicoRequest (PUT /api/servicos/{id})

| TC-ID | Cenário | Pré-condição | Input | Resultado Esperado | Critério |
|-------|---------|--------------|-------|-------------------|----------|
| TC-SRVU-01 | Descrição ausente | Dono/Admin | `{ "descricao": "", ... }` | 400, `mensagem: "A descrição é obrigatória"` | RF02 |
| TC-SRVU-02 | Descrição > 1000 | Dono | `{ "descricao": "A"*1001 }` | 400, `mensagem: "A descrição deve ter no máximo 1000 caracteres"` | RF02 |
| TC-SRVU-03 | Responsável > 200 | Dono | `{ "responsavel": "A"*201 }` | 400, `mensagem: "O responsável deve ter no máximo 200 caracteres"` | RF02 |
| TC-SRVU-04 | Observações > 2000 | Dono | `{ "observacoes": "A"*2001 }` | 400, `mensagem: "Observações deve ter no máximo 2000 caracteres"` | RF02 |
| TC-SRVU-03 | Funcionário edita serviço de outro | Funcionário A | PUT serviço do Funcionário B | 403, `mensagem: "Você só pode editar serviços que você registrou"` | Regra permissão |
| TC-SRVU-04 | Funcionário edita próprio | Funcionário A | PUT próprio serviço | 200 | Regra permissão |

#### ConcluirServicoRequest (PATCH /api/servicos/{id}/concluir)

| TC-ID | Cenário | Pré-condição | Input | Resultado Esperado | Critério |
|-------|---------|--------------|-------|-------------------|----------|
| TC-SRVC-01 | Serviço já concluído | Dono | PATCH serviço status=Concluido | 400, `mensagem: "Este serviço já foi concluído"` | Regra negócio |
| TC-SRVC-02 | Funcionário conclui de outro | Funcionário A | PATCH serviço do Funcionário B | 403, `mensagem: "Você só pode concluir serviços que você registrou"` | Regra permissão |
| TC-SRVC-03 | Conclusão válida | Dono | PATCH serviço status=Agendado | 200, status=Concluido, ConcluidoEm preenchido | RF02 |

#### LoginRequest (POST /api/auth/login)

| TC-ID | Cenário | Pré-condição | Input | Resultado Esperado | Critério |
|-------|---------|--------------|-------|-------------------|----------|
| TC-LOG-01 | Email ausente | — | `{ "email": "", "senha": "12345678" }` | 400 (binding) ou 401 | Binding/Regra |
| TC-LOG-02 | Senha ausente | — | `{ "email": "a@b.com", "senha": "" }` | 401, `mensagem: "E-mail ou senha inválidos"` | Regra |
| TC-LOG-03 | Credenciais inválidas | User existe | Email/senha errados | 401, `mensagem: "E-mail ou senha inválidos"` | Regra |
| TC-LOG-04 | User inativo | User ativo=false | Credenciais corretas | 401, `mensagem: "E-mail ou senha inválidos"` | Regra |
| TC-LOG-04b | Email uppercase | User existe | `{ "email": "USUARIO@TEST.COM", "senha": "12345678" }` | 200, token (email normalizado) | Normalização |
| TC-LOG-05 | Senha com espaços | User com senha "  abc  " | `{ "senha": "  abc  " }` | 200 (preserva espaços) | Normalização |

---

### 3.3 Testes de Autorização, Escopo e Precedência

| TC-ID | Cenário | Endpoint | Pré-condição | Resultado Esperado | Critério |
|-------|---------|----------|--------------|-------------------|----------|
| TC-AUTH-01 | Sem token (endpoint autenticado) | POST /api/condominios | Sem Authorization | 401, `erro: "Não autorizado"` | RF04 |
| TC-AUTH-02 | Token inválido/expirado | POST /api/condominios | Token JWT inválido | 401 | RF04 |
| TC-AUTH-03 | Admin condomínio A acessa recurso condomínio B | GET /api/locais | Token condomínio A, recurso B | 403, `mensagem: "Este local não pertence ao seu condomínio"` | RF04 |
| TC-AUTH-04 | Admin Geral acessa qualquer recurso | GET /api/condominios | Token geral=true | 200 (todos) | RF04 |
| TC-AUTH-05 | Funcionário edita serviço de outro | PUT /api/servicos/{id} | Token funcionário A, serviço B | 403, `mensagem: "Você só pode editar serviços que você registrou"` | RF04 |
| TC-AUTH-05b | Funcionário conclui serviço de outro | PATCH /api/servicos/{id}/concluir | Token funcionário A, serviço B | 403, `mensagem: "Você só pode concluir serviços que você registrou"` | RF04 |
| TC-AUTH-06 | Admin condomínio cria admin | POST /api/usuarios | Token admin condomínio, papel=AdminGeral | 403, `mensagem: "Administradores de condomínio só podem cadastrar ou editar funcionários"` | RF04 |
| TC-AUTH-07 | Acesso anônimo QR Code válido | GET /api/qrcode/{id} | Sem token | 200 (dados públicos) | RF04 |
| TC-AUTH-08 | Acesso anônimo QR Code inexistente | GET /api/qrcode/{id} | Sem token, UUID inexistente | 404, `mensagem: "QR Code não encontrado"` | RF04 |
| TC-AUTH-09 | Precedência: papel antes de validação (CondominioService) | POST /api/condominios | Token não-admin | 403 (papel) **antes** de validar campos | RF04, Precedência |
| TC-AUTH-10 | Precedência: existência antes de validação (LocalService.Atualizar) | PUT /api/locais/{id} | UUID inexistente | 404 **antes** de validar campos | RF04, Precedência |
| TC-AUTH-11 | Precedência: escopo antes de validação (ServicoService.Registrar) | POST /api/servicos | Local de outro condomínio | 403 **antes** de validar descrição | RF04, Precedência |
| TC-AUTH-12 | Rate limiting (autenticado) | Múltiplos requests | Exceder limite usuário | 429, `erro: "Limite de consultas excedido"` | RF04 |
| TC-AUTH-13 | Rate limiting (anônimo) | Múltiplos GET /api/qrcode | Exceder limite IP | 429 | RF04 |

---

### 3.4 Testes de Binding e Formato

| TC-ID | Cenário | Endpoint | Input | Resultado Esperado | Critério |
|-------|---------|----------|-------|-------------------|----------|
| TC-BIND-01 | JSON malformado | POST /api/condominios | `{ "nome": "teste", }` (vírgula extra) | 400, `erro: "Dados inválidos"` | BadHttpRequestException |
| TC-BIND-02 | Content-Type incorreto | POST /api/condominios | `text/plain` | 415 ou 400 | RF02 |
| TC-BIND-03 | UUID inválido no path | GET /api/locais/{id} | `id=abc` | 400 (route constraint) | RF04 |
| TC-BIND-04 | Paginação inválida (pagina=0) | GET /api/servicos/por-local/{id} | `?pagina=0&tamanho=20` | 200 (clamp para 1) | Regra service |
| TC-BIND-05 | Paginação tamanho > 100 | GET /api/servicos/por-local/{id} | `?tamanho=200` | 200 (clamp para 20) | Regra service |
| TC-BIND-06 | Enum TipoServico string inválida | POST /api/servicos | `"tipo": "Invalido"` | 400 (binding) | Binding nativo |
| TC-BIND-07 | Enum TipoServico numérico inválido | POST /api/servicos | `"tipo": 999` | 400 (binding) | Binding nativo |
| TC-BIND-08 | Enum TipoServico válido (string) | POST /api/servicos | `"tipo": "Limpeza"` | 201 | Binding nativo |
| TC-BIND-09 | Enum TipoServico válido (numérico) | POST /api/servicos | `"tipo": 0` (Limpeza=0) | 201 | Binding nativo |

---

### 3.5 Testes de Consulta (Endpoints GET)

| TC-ID | Cenário | Endpoint | Pré-condição | Resultado Esperado | Critério |
|-------|---------|----------|--------------|-------------------|----------|
| TC-GET-01 | QR Code anônimo válido | GET /api/qrcode/{id} | QR ativo | 200, dados local + serviços (max 20) | RF04 |
| TC-GET-02 | QR Code inativo | GET /api/qrcode/{id} | QR inativo | 404 | Regra negócio |
| TC-GET-03 | Lista condomínios (Admin Geral) | GET /api/condominios | Token geral | 200, lista todos | RF04 |
| TC-GET-04 | Lista condomínios (Admin condomínio) | GET /api/condominios | Token admin cond | 200, apenas seu | RF04 |
| TC-GET-05 | Lista locais com paginação | GET /api/locais | Token admin | 200, pagina/tamanho/total | RF04 |
| TC-GET-06 | Lista locais inclui inativos (admin) | GET /api/locais?incluirInativos=true | Token admin | 200, inclui inativos | RF04 |
| TC-GET-07 | Serviços por local paginado | GET /api/servicos/por-local/{id} | Token admin/func | 200, pagina/total/statusAtual | RF04 |

---

### 3.6 Testes de Normalização (Preservação de Comportamento)

| TC-ID | Cenário | Campo | Input | Valor Persistido/Processado | Critério |
|-------|---------|-------|-------|----------------------------|----------|
| TC-NORM-01 | Trim obrigatório | Nome condomínio | `"  Teste  "` | `"Teste"` | Normalização |
| TC-NORM-02 | Trim opcional vazio → null | Endereço | `"   "` | `null` | Normalização |
| TC-NORM-03 | Email lowercase | Email | `"USUARIO@TEST.COM"` | `"usuario@test.com"` | Normalização |
| TC-NORM-04 | CNPJ extrai dígitos | CNPJ | `"12.345.678/0001-95"` | `"12345678000195"` | Normalização |
| TC-NORM-05 | CNPJ só letras → null | CNPJ | `"abc"` | `null` | Normalização |
| TC-NORM-06 | Senha sem trim | Senha | `"  minha senha  "` | `"  minha senha  "` (preserva) | Normalização |
| TC-NORM-07 | Senha trim NÃO aplicado | Senha | `"  abc  "` | Length 11 (inclui espaços) | Normalização |

---

## 4. Estratégia de Comparação Antes/Depois

### 4.1 Baseline (Pré-Migração)

| Item | Como Capturar | Artefato |
|------|---------------|----------|
| **Respostas HTTP** | Executar suíte completa contra commit `e8a9b0b` | `qa/evidence/baseline/http_responses.json` |
| **Status codes** | Extrair de responses | `qa/evidence/baseline/status_codes.csv` |
| **Envelopes de erro** | Capturar corpo 400/401/403/404 | `qa/evidence/baseline/error_envelopes.json` |
| **Mensagens literais** | Extrair `mensagem` de cada 400 | `qa/evidence/baseline/messages.json` |
| **Precedência** | Logs de sequência (ex: papel antes de validação) | `qa/evidence/baseline/precedence.log` |
| **Normalização** | Verificar valores persistidos no DB | `qa/evidence/baseline/db_state.sql` |
| **Performance (RNF01)** | Medir latency validação (ms) | `qa/evidence/baseline/perf.json` |
| **Build warnings** | `dotnet build` | `qa/evidence/baseline/build.log` |

### 4.2 Pós-Migração (Pós-FluentValidation)

| Item | Como Comparar | Critério de Aceite |
|------|---------------|-------------------|
| Status codes | Diff CSV baseline vs novo | **Idênticos** para todos TCs |
| Envelope 400 | Diff JSON | Envelope `erro`/`mensagem` idêntico; primeiro erro igual |
| Mensagens | Diff JSON messages | Strings idênticas às de `Validacao.cs` (CA01/03/04 alinhadas) |
| Precedência | Diff logs sequência | Ordem idêntica: papel → existência → escopo → validação |
| Normalização | Diff DB state | Valores persistidos idênticos (trim, lowercase, CNPJ dígitos, senha sem trim) |
| Binding enum | Diff responses | 400 para inválidos, 201 para válidos |
| Rate limiting | Diff status | 429 idêntico |
| Build | `dotnet build` | Zero novos warnings |
| RNF01 | Medir latency validação | < 5ms overhead (Should) |

### 4.3 Ferramentas e Formato de Evidência

| Tipo | Formato | Localização |
|------|---------|-------------|
| HTTP Responses | JSON Lines (`.jsonl`) | `qa/evidence/<timestamp>/http_responses.jsonl` |
| Status Codes | CSV | `qa/evidence/<timestamp>/status_codes.csv` |
| Error Envelopes | JSON | `qa/evidence/<timestamp>/error_envelopes.json` |
| DB State | SQL dump (INSERTs) | `qa/evidence/<timestamp>/db_state.sql` |
| Logs Precedência | Texto estruturado | `qa/evidence/<timestamp>/precedence.log` |
| Performance | JSON | `qa/evidence/<timestamp>/perf.json` |
| Build Log | Texto | `qa/evidence/<timestamp>/build.log` |
| Test Run Summary | Markdown | `qa/evidence/<timestamp>/SUMMARY.md` |

---

## 5. Investigação dos ~90 Cenários Históricos

### 5.1 Status Atual (per PROGRESSO.md:64)

- **Primeira rodada**: ~90 cenários executados, 2 falhas (1 UTF-8 JSON → corrigido para 400; 1 erro de script ID vazio)
- **Segunda rodada**: Bloqueada por rate limiting (ainda por IP na época)
- **Verificações posteriores**: Direcionadas (edição local, JSON inválido, limite por usuário) — **não rodada completa**
- **Script**: **Não localizado** na inspeção
- **Dados de teste**: Registros duplicados no banco (Paineiras, usuários repetidos) — não removidos

### 5.2 Ação Requerida

| Ação | Responsável | Prazo |
|------|-------------|-------|
| **Recuperar script original** | PM/Dev | Antes de desbloquear |
| **Se irrecuperável: definir matriz equivalente** | QA + PM | Antes de desbloquear |
| **Matriz mínima**: 90 cenários cobrindo 5 papéis × 6 recursos × operações CRUD + bordas | QA | Entregar como `qa/evidence/matriz_permissao.csv` |
| **Autorizar limpeza dados duplicados** | Rodrigo | Antes de baseline |
| **Configurar rate limit alto/desabilitado** | Dev | Ambiente de teste QA |

### 5.3 Matriz Mínima de Permissão (Se Script Irrecuperável)

| Papel | Recurso | Operação | Cenários Mínimos |
|-------|---------|----------|------------------|
| Admin Geral | Condomínio | CRUD | Create, Read own/all, Update own/other, Activate/Deactivate |
| Admin Condomínio | Condomínio | Read/Update own | Read own, Update own (não activate), Create ❌ |
| Admin Condomínio | Local | CRUD own | Create, Read, Update, QR, Delete own |
| Admin Condomínio | Usuario | CRUD funcionários own | Create/Update/Delete funcionários, não admins |
| Funcionário | Servico | Create/Update own/Conclude own | Create, Update own, Conclude own, Read |
| Funcionário | Servico | Update/Conclude outro | 403 (negado) |
| Anônimo | QR Code | Read any | 200 (qualquer condomínio) |
| Todos | Rate Limit | Exceder | 429 |
| Todos | Auth | Sem token/inválido | 401 |
| Todos | Scope | Recurso outro condomínio | 403 |

**Total estimado**: ~90-100 cenários combinatórios.

---

## 6. Ambiente, Massa de Dados e Execução

### 6.1 Ambiente de Teste QA

| Componente | Configuração |
|------------|--------------|
| **OS** | Ubuntu 22.04+ / WSL2 |
| **Docker** | 24+ com Compose v2 |
| **.NET SDK** | 10.0.203+ |
| **PostgreSQL** | 14 (container `condominio-db`) |
| **pgAdmin** | 4 (porta 5050) |
| **Rate Limiting** | Desabilitado ou `PermitLimit: 10000` no `appsettings.Test.json` |
| **Seed** | `DadosDesenvolvimento.cs` (2 condomínios, 4 usuários, 5 locais) |
| **Dados extras** | Manter duplicados Paineiras/usuários (não limpar sem autorização) |

### 6.2 Massa de Dados (Seed Conhecida)

| Entidade | Quantidade | Detalhes |
|----------|------------|----------|
| Condomínios | 2 | `Condomínio Residencial Flores` (id conhecido), `Condomínio Aurora` |
| Usuários | 4 | `admin.geral@sistema.com` (Geral), `sindico@flores.com.br` (Admin Flores), `zelador@flores.com.br` (Func Flores), `sindico@aurora.com.br` (Admin Aurora) |
| Locais | 5 | Com QR Codes ativos |
| Serviços | Múltiplos | Histórico variado |
| Senha padrão | `Dev@12345` | Para todos usuários seed |

### 6.3 Comandos de Execução

```bash
# 1. Subir ambiente
cd /opt/data/projects/sistema-condominio-qr
docker-compose up -d
docker-compose ps  # verificar healthy

# 2. Build e migrate
cd backend
dotnet build SistemaCondominio.slnx
./.tools/dotnet-ef database update --project src/SistemaCondominio.Infrastructure --startup-project src/SistemaCondominio.Api

# 3. Rodar API (porta 5234)
ASPNETCORE_ENVIRONMENT=Development dotnet run --project src/SistemaCondominio.Api --urls http://localhost:5234

# 4. Executar suíte de regressão (exemplo com curl/httpie ou script Python/JS)
# Ver seção 7 para script sugerido

# 5. Frontend (opcional, para testes E2E)
cd ../../frontend
npm run dev  # porta 5173, proxy para 5234
```

### 6.4 Critérios de Aceite da Execução

| Critério | Threshold |
|----------|-----------|
| **Taxa de passagem** | 100% dos TCs obrigatórios (Must) |
| **TCs Should** | Documentar falhas conhecidas (ex: CA07 primeiro erro) |
| **Divergências** | Zero divergências não documentadas |
| **Evidências** | 100% dos TCs com artefato salvo em `qa/evidence/<timestamp>/` |
| **Tempo total** | < 30 min execução completa |

---

## 7. Script Sugerido de Execução Automatizada

> **Nota**: Este é um esqueleto. QA deve implementar em linguagem de preferência (Python, JS, Bash + curl, httpie, etc.)

```python
# qa/regression_runner.py (esqueleto)
import json, csv, subprocess, requests, time
from dataclasses import dataclass
from pathlib import Path

BASE_URL = "http://localhost:5234"
EVIDENCE_DIR = Path("qa/evidence") / time.strftime("%Y%m%d-%H%M%S")
EVIDENCE_DIR.mkdir(parents=True)

@dataclass
class TestCase:
    id: str
    endpoint: str
    method: str
    auth: str  # "geral", "admin_flores", "func_flores", "admin_aurora", "anon", "none"
    payload: dict
    expected_status: int
    expected_message: str = None
    check_precedence: bool = False

# Tokens obtidos via login prévio
TOKENS = {
    "geral": login("admin.geral@sistema.com", "Dev@12345"),
    "admin_flores": login("sindico@flores.com.br", "Dev@12345"),
    "func_flores": login("zelador@flores.com.br", "Dev@12345"),
    "admin_aurora": login("sindico@aurora.com.br", "Dev@12345"),
    "anon": None,
}

def run_test(tc: TestCase):
    headers = {"Accept": "application/json", "Content-Type": "application/json"}
    if tc.auth != "none":
        headers["Authorization"] = f"Bearer {TOKENS[tc.auth]}"
    
    resp = requests.request(tc.method, f"{BASE_URL}{tc.endpoint}", 
                           json=tc.payload, headers=headers, timeout=10)
    
    evidence = {
        "tc_id": tc.id,
        "request": {"method": tc.method, "url": tc.endpoint, "payload": tc.payload, "auth": tc.auth},
        "response": {"status": resp.status_code, "body": resp.json() if resp.headers.get("content-type","").startswith("application/json") else resp.text},
        "passed": resp.status_code == tc.expected_status 
                  and (tc.expected_message is None or resp.json().get("mensagem") == tc.expected_message),
    }
    
    # Salvar evidência
    (EVIDENCE_DIR / f"{tc.id}.json").write_text(json.dumps(evidence, indent=2, ensure_ascii=False))
    
    return evidence

# Lista de TCs (conforme seção 3)
TEST_CASES = [
    TestCase("TC-CON-01", "/api/condominios", "POST", "geral", {"nome": "", "cnpj": "12345678901234"}, 400, "Nome do condomínio é obrigatório"),
    # ... todos os TCs das seções 3.2-3.6
]

if __name__ == "__main__":
    results = [run_test(tc) for tc in TEST_CASES]
    # Gerar sumário
    summary = {
        "total": len(results),
        "passed": sum(1 for r in results if r["passed"]),
        "failed": sum(1 for r in results if not r["passed"]),
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    (EVIDENCE_DIR / "SUMMARY.json").write_text(json.dumps(summary, indent=2))
    (EVIDENCE_DIR / "SUMMARY.md").write_text(f"# Resumo Regressão FluentValidation\n\n{summary}")
    print(f"Passed: {summary['passed']}/{summary['total']}")
```

---

## 8. Lacunas que Dependem de Decisão PM/TCL

| # | Lacuna | Tipo | Responsável | Impacto no Plano |
|---|--------|------|-------------|------------------|
| 1 | **Versão exata FluentValidation** | Técnica | TCL | Define pacote, compatibilidade net10.0, licença |
| 2 | **Estrutura validators** (por operação vs por DTO com regras condicionais) | Técnica | TCL | Afeta número de arquivos, complexidade, mapeamento create/update |
| 3 | **Ponto de invocação** (service explícito vs filter customizado) | Técnica | TCL | Afeta precedência, complexidade, reutilização |
| 4 | **Medição RNF01** (<5ms) | Técnica | TCL + QA | Requer baseline de performance pré-migração |
| 5 | **Versão exata e licença** | Governança | Rodrigo + TCL | Bloqueia `dotnet add package` |
| 6 | **Limpeza dados duplicados** | Operacional | Rodrigo | Afeta baseline de CA08 |
| 7 | **Rate limit ambiente teste** | Operacional | Dev | Bloqueia execução completa CA08 |
| 8 | **Recuperação script ~90 cenários** | Operacional | PM/Dev | Se irrecuperável, QA define matriz equivalente |
| 9 | **Estratégia futura erro** (RFC 7807) | Estratégico | PM + Rodrigo | Fora do escopo, mas decisão arquitetural |

---

## 9. Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Quebra de contrato (envelope 400)** | Média se mal implementado | Alto (frontend quebra) | Manter envelope legado; testar exhaustivamente TC-BIND/TC-CON/TC-USR |
| **Precedência alterada (400 vs 403/404)** | Alta se filter global usado | Alto (vazamento info) | Invocação explícita no service; testar TC-AUTH-09/10/11 |
| **Normalização perdida** (senha trim, CNPJ) | Média se validator transforma | Médio (segurança/UX) | Normalização ANTES do validator; testar TC-NORM |
| **Binding enum quebrado** | Baixa (nativo) | Baixo | Testar TC-BIND-06/07/08/09 |
| **Rate limit impede regressão** | Alta (já ocorreu) | Alto (bloqueia CA08) | Desabilitar/eleva limite em ambiente QA |
| **Script ~90 cenários perdido** | Alta (já não localizado) | Alto (CA08 não demonstrável) | QA define matriz equivalente; autorizar limpeza dados |
| **Build warnings novos** | Média | Baixo | `dotnet build` no CI; comparar com baseline |
| **Frontend quebra com envelope novo** | Alta se `errors` array | Alto | Manter envelope legado; testar frontend E2E (33/33) |
| **Dependência não aprovada** | Média | Bloqueador | Rodrigo aprovar antes de `dotnet add package` |

---

## 10. Critérios de Go/No-Go para Implementação

| Critério | Status Atual | Ação Necessária |
|----------|--------------|-----------------|
| QA entrega plano regressão aprovado | ✅ Este documento | — |
| TCL detalha proposta técnica (versão, estrutura, ponto invocação, RNF01) | ⏳ Pendente | TCL entregar `PROPOSTA-TECNICA-DETALHADA.md` |
| Rodrigo aprova dependência FluentValidation | ⏳ Pendente | Rodrigo confirmar via handoff |
| QA prepara ambiente teste (rate limit, seed, dados) | ⏳ Pendente | QA executar setup e validar |
| Baseline capturado (commit e8a9b0b) | ⏳ Pendente | QA executar captura antes de qualquer mudança |
| Matriz permissão ~90 cenários definida | ⏳ Pendente | QA entregar `matriz_permissao.csv` |

**Go**: Todos ✅ | **No-Go**: Qualquer ⏳ pendente

---

## 11. Próximos Passos e Responsáveis

| Etapa | Responsável | Entregável | Prazo |
|-------|-------------|------------|-------|
| 1. Aprovar este plano | PM (Polaris) | Aprovação no handoff | Imediato |
| 2. Detalhar proposta técnica | TCL (Atlas) | `PROPOSTA-TECNICA-DETALHADA.md` | Pós-aprovação plano |
| 3. Aprovar dependência | Rodrigo | Confirmação no handoff | Pós-proposta técnica |
| 4. Preparar ambiente QA | Dev/QA | `appsettings.Test.json`, rate limit, seed | Paralelo |
| 5. Capturar baseline | QA | `qa/evidence/baseline/` | Antes de qualquer implementação |
| 6. Definir matriz permissão | QA | `qa/evidence/matriz_permissao.csv` | Antes de implementação |
| 7. Implementar | Dev | Código + validators | Pós-go |
| 8. Executar regressão | QA | `qa/evidence/<timestamp>/` | Pós-implementação |
| 9. Revisão independente | TCL + QA | Diff evidências, recomendação | Pós-regressão |
| 10. Deploy | Rodrigo | Autorização específica | Pós-aprovação técnica |

---

## 12. Anexos

### A. Glossário de Códigos de Teste

| Prefixo | Significado |
|---------|-------------|
| TC-CON | Condomínio (create/update) |
| TC-LOC | Local (create/update) |
| TC-USR | Usuário (create/update) |
| TC-SRV | Serviço (registrar) |
| TC-SRVU | Serviço (atualizar) |
| TC-SRVC | Serviço (concluir) |
| TC-LOG | Login |
| TC-AUTH | Autorização/Escopo/Precedência |
| TC-BIND | Binding/Formato |
| TC-GET | Consultas (GET) |
| TC-NORM | Normalização |

### B. Referências de Arquivos-Chave

| Arquivo | Localização | Relevância |
|---------|-------------|------------|
| `Validacao.cs` | `backend/src/SistemaCondominio.Application/Validacao.cs` | Fonte da verdade validação/normalização |
| `Dtos.cs` | `backend/src/SistemaCondominio.Application/Dtos/Dtos.cs` | DTOs reais (nomes, tipos) |
| `TratamentoExcecoes.cs` | `backend/src/SistemaCondominio.Api/Infra/TratamentoExcecoes.cs` | Envelope erro, mapeamento status |
| `cliente.ts` | `frontend/src/api/cliente.ts` | Consumidor envelope erro |
| `Services/*.cs` | `backend/src/SistemaCondominio.Application/Servicos/` | Ordem validação vs segurança |
| `Endpoints/*.cs` | `backend/src/SistemaCondominio.Api/Endpoints/` | Rotas, auth, binding |
| `DadosDesenvolvimento.cs` | `backend/src/SistemaCondominio.Api/Dados/DadosDesenvolvimento.cs` | Seed conhecida |

---

**Fim do Plano de Regressão — FluentValidation**

*Este documento é a especificação completa para regressão reproduzível. Nenhuma implementação deve iniciar sem aprovação dos critérios de Go/No-Go.*