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

1. Adicionar pacote `FluentValidation` (base, não AspNetCore) ao projeto `SistemaCondominio.Application`
2. Criar validators para os principais DTOs de **request** (command/input) — **nomes reais do código**:
   - `CondominioRequest` (compartilhado create/update; regras condicionais)
   - `LocalRequest` (compartilhado create/update)
   - `UsuarioRequest` (compartilhado create/update; senha obrigatória no create, opcional no update)
   - `RegistrarServicoRequest` / `AtualizarServicoRequest` / `ConcluirServicoRequest`
   - `LoginRequest`
3. Registrar validators no DI da API explicitamente (`builder.Services.AddValidatorsFromAssemblyContaining<CondominioRequestValidator>()` etc.) — **não usar scanning automático do AspNetCore**
4. Configurar pipeline para manter contrato atual (`{ "erro": "...", "mensagem": "..." }` — primeiro erro) via middleware customizado ou `IResult` customizado; loggar todos erros internamente para auditoria
5. Remover chamadas manuais de `Validacao.*` nos services correspondentes, delegando ao FluentValidation
6. Garantir que mensagens de erro permaneçam em **português brasileiro** e claras, **alinhadas ao código atual** (`Validacao.cs`)
7. Validar que todos os cenários de permissão existentes (Etapa 5 do PROGRESSO.md) continuem passando

### Fora de escopo (explicitamente excluído)

- Validação de query parameters de paginação (`pagina`, `tamanho`) — já tratada no service
- Validações de regras de negócio complexas que dependem de estado do banco (ex.: "usuário só conclui próprio serviço", "escopo de condomínio") — permanecem no service
- Testes unitários dos validators (planejados para depois, conforme PROGRESSO.md)
- Serilog (outra pendência separada)
- Atualização do `Microsoft.OpenApi` (pendência separada)
- Notificações por e-mail / histórico 12 meses (pendências maiores)
- `TrocarSenhaRequestDto` — não existe; troca de senha integrada na edição de usuário
- `FluentValidation.AspNetCore` — não usar; integração MVC não aplica a Minimal APIs

## Requisitos

### Funcionais

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF01 | Validators cobrem todos os DTOs de request listados no escopo (nomes reais) | Must |
| RF02 | Falha de validação retorna HTTP 400 com corpo JSON contendo `erro` e `mensagem` (primeiro erro) em pt-BR | Must |
| RF03 | Validações manuais (`Validacao.*`) removidas dos services para os DTOs cobertos | Must |
| RF04 | Comportamento de rate limiting, autenticação, autorização e escopo de condomínio **inalterado** | Must |
| RF05 | Build (`dotnet build backend/SistemaCondominio.slnx`) passa sem warnings novos | Must |

### Não-funcionais

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RNF01 | Tempo de resposta de validação < 5 ms (overhead negligenciável) | Should |
| RNF02 | Código de validação declarativo, legível e testável isoladamente | Should |
| RNF03 | Zero breaking changes na API pública (mesmos códigos de status, mesmo formato de erro `erro`/`mensagem`) | Must |

## Critérios de Aceite

| Cenário | Dado | Quando | Então |
|---------|------|--------|-------|
| CA01 | CNPJ com 13 dígitos | POST `/api/condominios` | Retorna 400, mensagem **"CNPJ deve conter 14 dígitos"** |
| CA02 | E-mail inválido | POST `/api/usuarios` | Retorna 400, mensagem **"E-mail inválido"** |
| CA03 | Senha com 6 caracteres | POST `/api/usuarios` | Retorna 400, mensagem **"A senha deve ter no mínimo 8 caracteres"** |
| CA04 | Campo obrigatório ausente (ex.: `nome` do local) | POST `/api/locais` | Retorna 400, mensagem **"Nome do local é obrigatório"** |
| CA05 | ~~Tipo de serviço inválido~~ | — | **Removido** — binding nativo do enum `TipoServico` já valida |
| CA06 | DTO válido | Qualquer endpoint coberto | Request processado normalmente (201/200), validações de negócio (escopo, permissão) ainda executam |
| CA07 | Múltiplos erros no mesmo request | POST `/api/condominios` com CNPJ inválido + nome vazio | Retorna 400 com **primeiro erro** no envelope `erro`/`mensagem`; todos logados internamente |
| CA08 | Script de ~90 cenários de permissão (Etapa 5) | Execução completa reproduzível | Todos os cenários continuam passando (mesmos status codes, mesmas regras de 403/404) |

---

**Decisão**: Esta discovery propõe a integração do FluentValidation como melhoria incremental de qualidade de código, alinhada ao AGENTS.md e à pendência registrada no PROGRESSO.md. O escopo é contido, de baixo risco e não exige dependências externas além do pacote base `FluentValidation`.

**Próximo passo**: Aprovação do Tech Lead (TCL) para iniciar implementação, **após** QA definir regressão reproduzível e Rodrigo aprovar dependência. Handoff registrado em `HANDOFF-FluentValidation.md`. Decisões de produto em `RESOLUCAO-BLOQUEADORES-FluentValidation.md`.