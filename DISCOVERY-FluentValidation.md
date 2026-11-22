# Discovery: Integração do FluentValidation

## Problema

Atualmente, a validação de entrada nos endpoints da API é feita manualmente dentro dos serviços (ex.: `Validacao.ValidarEmail`, `Validacao.ValidarCnpj`, `Validacao.ValidarSenha`, verificações de nulo/tamanho em DTOs). Isso gera:

- Código de validação espalhado e repetido entre serviços
- Difícil manutenção e evolução de regras (ex.: mudar regra de senha exige tocar vários arquivos)
- Ausência de validação declarativa e testável isoladamente
- Inconsistência: alguns campos validados no service, outros no controller, outros nem validados
- O AGENTS.md lista **FluentValidation** como "Biblioteca Principal" (linha 115), mas a biblioteca não está instalada nem utilizada

## Objetivo

Substituir a validação manual por **FluentValidation** de forma incremental, começando pelos DTOs de entrada mais críticos (cadastro/edição de condomínios, locais, usuários e serviços), mantendo compatibilidade com o comportamento atual (retorno 400 com mensagens em português) e sem quebrar endpoints já validados via testes manuais.

## Escopo

### Incluído (MVP desta discovery)

1. Adicionar pacote `FluentValidation.AspNetCore` ao projeto `SistemaCondominio.Api`
2. Criar validators para os principais DTOs de **request** (command/input):
   - `RegistrarCondominioRequestDto` / `AtualizarCondominioRequestDto`
   - `RegistrarLocalRequestDto` / `AtualizarLocalRequestDto`
   - `RegistrarUsuarioRequestDto` / `AtualizarUsuarioRequestDto` / `TrocarSenhaRequestDto`
   - `RegistrarServicoRequestDto` / `AtualizarServicoRequestDto` / `ConcluirServicoRequestDto`
   - `LoginRequestDto`
3. Registrar validators no DI (`builder.Services.AddValidatorsFromAssemblyContaining<Program>()`)
4. Configurar pipeline para retornar `ValidationProblemDetails` (RFC 7807) com status 400 — manter contrato atual (`{ "erro": "...", "mensagem": "..." }` ou array de erros) via `ConfigureApiBehaviorOptions` ou middleware customizado
5. Remover chamadas manuais de `Validacao.*` nos services correspondentes, delegando ao FluentValidation
6. Garantir que mensagens de erro permaneçam em **português brasileiro** e claras (ex.: "CNPJ deve conter 14 dígitos numéricos")
7. Validar que todos os cenários de permissão existentes (Etapa 5 do PROGRESSO.md) continuem passando

### Fora de escopo (explicitamente excluído)

- Validação de query parameters de paginação (`pagina`, `tamanho`) — já tratada no service
- Validações de regras de negócio complexas que dependem de estado do banco (ex.: "usuário só conclui próprio serviço", "escopo de condomínio") — permanecem no service
- Testes unitários dos validators (planejados para depois, conforme PROGRESSO.md)
- Serilog (outra pendência separada)
- Atualização do `Microsoft.OpenApi` (pendência separada)
- Notificações por e-mail / histórico 12 meses (pendências maiores)

## Requisitos

### Funcionais

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF01 | Validators cobrem todos os DTOs de request listados no escopo | Must |
| RF02 | Falha de validação retorna HTTP 400 com corpo JSON contendo `erro` e `mensagem` (ou `errors` array) em pt-BR | Must |
| RF03 | Validações manuais (`Validacao.*`) removidas dos services para os DTOs cobertos | Must |
| RF04 | Comportamento de rate limiting, autenticação, autorização e escopo de condomínio **inalterado** | Must |
| RF05 | Build (`dotnet build backend/SistemaCondominio.slnx`) passa sem warnings novos | Must |

### Não-funcionais

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RNF01 | Tempo de resposta de validação < 5 ms (overhead negligenciável) | Should |
| RNF02 | Código de validação declarativo, legível e testável isoladamente | Should |
| RNF03 | Zero breaking changes na API pública (mesmos códigos de status, mesmo formato de erro) | Must |

## Critérios de Aceite

| Cenário | Dado | Quando | Então |
|---------|------|--------|-------|
| CA01 | CNPJ com 13 dígitos | POST `/api/condominios` | Retorna 400, mensagem "CNPJ deve conter 14 dígitos numéricos" |
| CA02 | E-mail inválido | POST `/api/usuarios` | Retorna 400, mensagem "E-mail inválido" |
| CA03 | Senha com 6 caracteres | POST `/api/usuarios` | Retorna 400, mensagem "Senha deve ter no mínimo 8 caracteres" |
| CA04 | Campo obrigatório ausente (ex.: `nome` do local) | POST `/api/locais` | Retorna 400, mensagem "Nome é obrigatório" |
| CA05 | Tipo de serviço inválido | POST `/api/servicos` | Retorna 400, mensagem "Tipo de serviço inválido" |
| CA06 | DTO válido | Qualquer endpoint coberto | Request processado normalmente (201/200), validações de negócio (escopo, permissão) ainda executam |
| CA07 | Múltiplos erros no mesmo request | POST `/api/condominios` com CNPJ inválido + nome vazio | Retorna 400 com **todos** os erros (não apenas o primeiro) |
| CA08 | Script de ~90 cenários de permissão (Etapa 5) | Execução completa | Todos os cenários continuam passando (mesmos status codes, mesmas regras de 403/404) |

---

**Decisão**: Esta discovery propõe a integração do FluentValidation como melhoria incremental de qualidade de código, alinhada ao AGENTS.md e à pendência registrada no PROGRESSO.md. O escopo é contido, de baixo risco e não exige dependências externas.

**Próximo passo**: Aprovação do Tech Lead (TCL) para iniciar implementação. Handoff registrado em `HANDOFF-FluentValidation.md`.