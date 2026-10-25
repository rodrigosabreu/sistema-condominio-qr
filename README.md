# Sistema de Gestão de Condomínios com QR Codes

Sistema para condomínios onde QR Codes em locais comuns permitem aos condôminos acessar informações sobre serviços, manutenções, interdições e outros eventos.

## Funcionalidades

- QR Codes posicionados em locais do condomínio (banheiros, salões, churrasqueiras, jardins, hortas, etc.)
- Condôminos escaneiam QR Codes com smartphones
- Sistema exibe informações: serviço realizado (limpeza, manutenção, jardinagem), datas, responsáveis, status de interdição
- Histórico acessível via link único por QR Code

## Componentes

- **Gerador de QR Codes**: Sistema de geração de QR Codes únicos por local/serviço
- **API de Consulta**: Endpoint REST para fetch de informações por QR Code ID
- **Dashboard Administrativo**: Gestão de locais, serviços e QR Codes
- **Banco de Dados**: Armazenamento de locais, QR Codes, serviços e histórico

## Documentação para Agentes de IA

Este projeto utiliza o arquivo `AGENTS.md` para orientar agentes de IA no desenvolvimento. Para mais informações sobre engenharia agêntica, veja as postagens no LinkedIn sobre o tema.

## Requisitos de Qualidade

- QR Codes devem ser legíveis mesmo com logo do condomínio no centro
- Sistema deve funcionar offline com cache de última atualização
- Notificações push para condôminos sobre interdições
- Histórico de 12 meses acessível por histórico do local
- Versão mobile-first
- Acessibilidade (leitores de tela, contraste de cores)
