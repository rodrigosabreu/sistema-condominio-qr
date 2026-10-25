---
inclusion: auto
name: Sistema de Gestão de Condomínios com QR Codes
description: Guia para agentes que desenvolvem sistema de gerenciamento de condomínios com QR Codes para serviços e informações
---

# Agente: Sistema de Condomínios QR

## Propósito
Este agente auxilia no desenvolvimento de um sistema para condomínios onde QR Codes em locais comuns permitem aos condôminos acessar informações sobre serviços, manutenções, interdições e outros eventos.

## Cenário de Uso
- QR Codes posicionados em locais do condomínio (banheiros, salões, churrasqueiras, jardins, hortas, etc.)
- Condôminos escaneiam QR Codes com smartphones
- Sistema exibe informações: serviço realizado (limpeza, manutenção, jardinagem), datas, responsáveis, status de interdição
- Histórico acessível via link único por QR Code

## Estrutura do Sistema

### Componentes Principais
- **Gerador de QR Codes**: Sistema de geração de QR Codes únicos por local/serviço
- **API de Consulta**: Endpoint REST para fetch de informações por QR Code ID
- **Dashboard Administrativo**: Gestão de locais, serviços e QR Codes
- **Banco de Dados**: Armazenamento de locais, QR Codes, serviços e histórico

### Tipos de Locais
- Banheiros (masculino/feminino)
- Salões de festas
- Churrasqueiras
- Áreas de lazer (quadra, playground)
- Jardins e áreas verdes
- Hortas comunitárias
- Garagens
- Outros (especificar no cadastro)

### Tipos de Serviços/Eventos
- **Limpeza**: Frequência (diária, semanal, mensal), responsável, checklist
- **Manutenção**: Tipo (elétrica, hidráulica, estrutural), status (em andamento, concluído), previsão
- **Interdição**: Motivo, período, data de reabertura prevista
- **Manutenção preventiva**: Agendamento, verificação, relatório
- **Jardinagem/Horta**: Serviço realizado, plantio, colheita

## Padrões de Implementação

### Design de Banco de Dados
```sql
-- Tabela de Locais
locations (
  id: UUID,
  name: VARCHAR,
  type: ENUM('banheiro', 'salao', 'churrasqueira', 'lazer', 'jardim', 'horta', 'garagem', 'outro'),
  floor: INTEGER,
  coordinates: POINT,
  qr_code_id: UUID,
  active: BOOLEAN
)

-- Tabela de Serviços/Eventos
services (
  id: UUID,
  location_id: UUID,
  type: ENUM('limpeza', 'manutencao', 'interdicao', 'preventiva', 'jardinagem', 'horta'),
  description: TEXT,
  status: ENUM('agendado', 'em_andamento', 'concluido', 'interrompido'),
  scheduled_at: TIMESTAMP,
  completed_at: TIMESTAMP,
  responsible: VARCHAR,
  notes: TEXT
)

-- Tabela de QR Codes
qr_codes (
  id: UUID,
  location_id: UUID,
  code: VARCHAR(uniq),  -- O ID da entidade é o código do QR
  active: BOOLEAN,
  created_at: TIMESTAMP
)
```

### Padrão de URL para QR Codes
```
https://seudominio.com/qrcode/{qr_code_id}
```
O QR Code armazena apenas o ID único que aponta para o serviço/locak.atual

### Estrutura de Resposta da API
```json
GET /api/services/by-location/{locationId}
{
  "location": {
    "id": "...",
    "name": "Banheiro Masculino - 1º Andar",
    "type": "banheiro",
    "qrCodeId": "..."
  },
  "currentStatus": {
    "lastService": {
      "type": "limpeza",
      "completedAt": "2026-10-25T10:30:00Z",
      "responsible": "João Silva"
    },
    "currentInterruption": null,
    "nextScheduled": {
      "type": "limpeza",
      "scheduledAt": "2026-10-26T08:00:00Z"
    }
  }
}
```

## Requisitos de Qualidade
- QR Codes devem ser legíveis mesmo com logo do condomínio no centro
- Sistema deve funcionar offline com cache de última atualização
- Notificações push para condôminos sobre interdições
- Histórico de 12 meses acessível por histórico do local

## Integrações Sugeridas
- Sistema de gestão de moradores (API de cadastro)
- Sistema de pagamento de condomínio (para alertas de débito)
- Plataforma de mensagens (WhatsApp Business API para alertas)

## Observações
- O QR Code deve ser dinâmico para permitir atualização de conteúdo sem reimpresão
- Considere versão mobile-first do sistema
- Acessibilidade (leitores de tela, contraste de cores)