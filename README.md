# Sistema de Gestão de Condomínios com QR Codes

Sistema seguro e multi-tenant para condomínios onde QR Codes em locais comuns permitem aos condôminos acessar informações sobre serviços, manutenções, interdições e outros eventos, com isolamento total de dados entre condomínios.

## Funcionalidades

- QR Codes posicionados em locais do condomínio (banheiros, salões, churrasqueiras, jardins, hortas, etc.)
- Moradores escaneiam QR Codes com smartphones para visualizar informações (sem cadastro)
- Funcionários registram e concluem serviços (limpeza, manutenção, jardinagem)
- Administradores gerenciam locais, serviços e usuários do condomínio
- Histórico acessível via link único por QR Code com paginação
- Notificações por email para administradores sobre eventos
- Contagem de visualizações de QR Codes para rastreamento de uso

## Segurança e Multi-tenancy

- **Isolamento por condomínio**: Cada condomínio tem dados completamente isolados
- **Prevenção de horizontal privilege escalation**: Usuários não acessam dados de outros condomínios
- **Autenticação JWT**: Tokens com escopo limitado ao condomínio do usuário
- **Validação obrigatória**: Toda consulta verifica condomínio do usuário autenticado
- **Auditoria de acesso**: Logs de todas as consultas para rastreamento
- **Rate limiting**: Proteção contra scraping e ataques

## Papéis e Permissões

### Super Admin
- Acesso total a todos os condomínios
- Gerencia administradores de condomínio
- Dashboard consolidado

### Administrador de Condomínio
- Acesso limitado ao seu condomínio
- Gerencia locais, serviços e funcionários
- Recebe notificações por email

### Funcionário
- Registra e conclui serviços do condomínio
- Visualiza dados do seu condomínio
- Não edita serviços de outros usuários

### Moradores
- Acesso livre sem cadastro
- Apenas visualização via QR Code
- Não registra serviços

## Componentes

- **Gerador de QR Codes**: Sistema de geração de QR Codes únicos por local
- **API de Consulta**: Endpoint REST com validação de escopo por condomínio
- **Dashboard Administrativo**: Gestão de locais, serviços e QR Codes (por condomínio)
- **Gateway de Autenticação**: Validação de JWT e verificação de escopo
- **Banco de Dados**: Armazenamento multi-tenant com isolamento por condomínio
- **Sistema de Notificações**: Envio de emails para administradores

## Documentação para Agentes de IA

Este projeto utiliza o arquivo `AGENTS.md` para orientar agentes de IA no desenvolvimento. O documento define:

- Stack e padrões de implementação
- Schema de banco de dados multi-tenant
- Endpoints API com validações de segurança
- Padrões de localização (português)
- Requisitos de qualidade e acessibilidade

Para mais informações sobre engenharia agêntica, veja as postagens no LinkedIn sobre o tema.

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
