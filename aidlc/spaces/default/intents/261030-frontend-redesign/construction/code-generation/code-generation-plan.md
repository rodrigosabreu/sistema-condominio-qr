# Plano de Geração de Código - Redesign Frontend

**Data:** 2026-10-30  
**Intent:** 261030-frontend-redesign  
**Fase:** CONSTRUCTION

## Visão Geral

Redesenhar completamente o visual do frontend (pasta `frontend/`), mantendo React 19 + Vite + Tailwind 4 e toda a lógica de negócio, rotas, autenticação e integração com a API .NET. Criar um novo design system (paleta, tipografia, componentes) moderno e consistente, aplicado em todas as páginas.

**Direção visual aprovada pelo humano:** tema **claro corporativo**, estilo Linear/Notion/Stripe — fundo claro, sidebar escura, componentes limpos com bordas sutis e sombras leves. **Sem glassmorphism, sem gradientes, sem fundo dark roxo.**

## Arquitetura do Design System

### 1. Paleta de Cores

Sistema de cores corporativo claro, inspirado em Linear/Notion/Stripe:

```
background: {
  page: '#f8fafc'     (slate-50, fundo da área de conteúdo)
  surface: '#ffffff'  (cards e painéis)
  sidebar: '#0f172a'  (slate-900, sidebar escura)
}
primary: {
  50: '#eef2ff'
  100: '#e0e7ff'
  500: '#6366f1'
  600: '#4f46e5' (principal, indigo corporativo)
  700: '#4338ca'
}
accent: {
  success: '#059669' (emerald-600)
  warning: '#d97706' (amber-600)
  danger: '#dc2626'  (red-600)
  info: '#0284c7'    (sky-600)
}
text: {
  primary: '#0f172a'   (slate-900)
  secondary: '#475569' (slate-600)
  muted: '#94a3b8'     (slate-400)
  onDark: '#f8fafc'    (texto sobre sidebar escura)
}
border: '#e2e8f0'      (slate-200, bordas sutis)
```

### 2. Tipografia

- **UI e títulos**: Inter (system-ui fallback) — remover Space Grotesk
- **Títulos**: `font-semibold tracking-tight` (estilo corporativo sóbrio)
- **Sizes**: sistema baseado em rem com escalas consistentes

### 3. Componentes Base

Criar biblioteca de componentes reutilizáveis em `src/componentes/ui/`:

- `Button.tsx` - Botões primários, secundários, ghost, danger
- `Card.tsx` - Cards brancos com borda sutil e sombra leve (sem glassmorphism)
- `Input.tsx` - Inputs com estados de focus/error
- `Badge.tsx` - Badges para status
- `Modal.tsx` - Modal com animações
- `Select.tsx` - Dropdown select
- `Toast.tsx` - Toast notifications (já existe, redesenhar)
- `Table.tsx` - Tabelas responsivas
- `Tabs.tsx` - Abas de navegação
- `Avatar.tsx` - Avatares de usuário

### 4. Páginas Redesenhadadas

Aplicar o novo design system em todas as páginas:

1. **Login** (`src/paginas/Login.tsx`)
   - Layout limpo sobre fundo claro (slate-50)
   - Card branco centralizado com borda sutil
   - Input design melhorado
   - Animações de entrada sutis

2. **Painel** (`src/paginas/Painel.tsx`)
   - Dashboard com cards de KPIs
   - Grid responsivo
   - Gráficos simples (bar/line)
   - Status recentes

3. **Condomínios** (`src/paginas/Condominios.tsx`)
   - Lista de condomínios
   - Card design para cada item
   - Search e filters
   - Modal para criar/editar

4. **Locais** (`src/paginas/Locais.tsx`)
   - Grid de locais com QR codes
   - Card design com informações
   - Status visual (ativo/inativo)
   - Ações (imprimir, editar)

5. **Serviços** (`src/paginas/Servicos.tsx`)
   - Lista de serviços com status
   - Card design com informações
   - Timeline de histórico
   - Formulário de registro

6. **Usuários** (`src/paginas/Usuarios.tsx`)
   - Lista de usuários com papéis
   - Card design com avatar
   - Badges de papel
   - Modal de criar/editar

7. **QrPublico** (`src/paginas/QrPublico.tsx`)
   - Visualização pública do QR Code
   - Informações do local
   - Serviços recentes
   - Design limpo e responsivo

## Estrutura de Arquivos

```
frontend/src/
├── componentes/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Select.tsx
│   │   ├── Table.tsx
│   │   ├── Tabs.tsx
│   │   ├── Avatar.tsx
│   │   └── Layout.tsx
│   ├── QrCodeDialog.tsx
│   └── Toast.tsx
├── paginas/
│   ├── Login.tsx
│   ├── Painel.tsx
│   ├── Condomínios.tsx
│   ├── Locais.tsx
│   ├── Servicos.tsx
│   ├── Usuarios.tsx
│   └── QrPublico.tsx
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   └── index.ts
├── utils/
│   └── cn.ts
└── App.tsx
```

## Implementação

### Etapa 1: Criar biblioteca de componentes UI

1. Criar estrutura de diretórios `src/componentes/ui/`
2. Implementar componentes base (Button, Card, Input, Badge, Modal, Select, Table, Tabs, Avatar)
3. Criar utilitários (`cn.ts` para classnames condicionais)
4. Criar arquivo de tema (`src/theme/index.ts`)

### Etapa 2: Atualizar App.tsx e Layout.tsx

1. Atualizar App.tsx com novo sistema de rotas
2. Atualizar Layout.tsx com novo design
3. Criar sistema de sidebar/navegação
4. Criar header com user menu

### Etapa 3: Redesenhar páginas

1. Login.tsx - layout claro, card branco, inputs
2. Painel.tsx - Dashboard com KPIs
3. Condomínios.tsx - Lista de condomínios
4. Locais.tsx - Grid de locais
5. Servicos.tsx - Lista de serviços
6. Usuarios.tsx - Lista de usuários
7. QrPublico.tsx - Visualização pública

### Etapa 4: Atualizar CSS global

1. Atualizar `index.css` com nova paleta
2. Criar classes utilitárias customizadas
3. Atualizar animações
4. Ajustar responsividade

## Ferramentas e Bibliotecas

- **React 19.3.1** - Framework principal
- **Vite 8.3.4** - Build tool
- **Tailwind CSS 4.3.3** - Framework CSS
- **React Router DOM 7.18.4** - Roteamento
- **TypeScript 5.9.3** - Typagem

## Notas de Segurança

- Manter autenticação JWT existente
- Preservar rotas protegidas
- Manter validação de formData
- Garantir responsividade mobile-first

## Critérios de Sucesso

- [ ] Todos os componentes UI implementados
- [ ] Todas as páginas redesenhadas
- [ ] Design system consistente
- [ ] Responsivo mobile-first
- [ ] Performance mantida
- [ ] Código limpo e manutenível

## Testing Contract
```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "org",
  "ordering": "implement each applicable testable layer, then write and run that layer's tests.",
  "scope": "feature",
  "test_strategy": "standard",
  "project_type": "brownfield",
  "applicable_notes": [
    {
      "layer": "org",
      "text": "We treat tests as a first-class deliverable in every Bolt. The specific\nmethodology (TDD, BDD, ATDD, or classic test-after) is affirmed at\npractices-discovery and recorded in `team.md` under this heading with explicit\n`Methodology` and `Ordering` fields; Code Generation resolves those fields\nindependently from coverage, tooling, and scope notes.\n\nWhen no posture has been affirmed, our default per scope is:\n- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer, then write and run\n  that layer's tests.\n- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage\n  floor and CI execution before merge.\n- `bugfix`, `security-patch` add a targeted regression for the specific\n  bug/vulnerability and require the existing suite to remain green.\n- `express` uses the Minimal strategy: requirement-driven unit tests (one per\n  requirement, with a happy-path floor per component); existing tests remain\n  green.\n- `poc`, `refactor`, `workshop` add no extra new-test floor and require the\n  existing suite to remain green.\n\nThe active `Test Strategy` still applies in every scope and determines test\nvolume/types. Scope floors are additive; they never reduce or replace the\nselected strategy.\n\nBuild and Test verifies defined coverage floors and affirmed quality targets;\nthey may not be weakened to make a step pass.\n\nAffirm a stricter posture in `team.md` if the team commits to one."
    }
  ],
  "obligations": {
    "strategy": "standard",
    "strategy_volume": [
      "Five to eight tests per component.",
      "Unit tests plus integration tests for key boundaries.",
      "Add E2E, performance, or security tests when requirements demand them."
    ],
    "scope_floor": [
      "Meet an 80% line-coverage floor.",
      "Run the selected tests in CI before merge."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Verify the existing test runner/configuration and record the exact unit-scoped command.",
    "runner_ready_before_first_test": true,
    "testable_layers": [
      "Data model / database behavior",
      "Repository / data access",
      "Business logic",
      "API / endpoint",
      "Frontend behavior"
    ],
    "steps": [
      "Project structure and production configuration skeleton.",
      "Verify the existing test runner/configuration and record the exact unit-scoped command.",
      "Data model / database behavior - implement.",
      "Data model / database behavior - write and run its tests after implementation.",
      "Repository / data access - implement.",
      "Repository / data access - write and run its tests after implementation.",
      "Business logic - implement.",
      "Business logic - write and run its tests after implementation.",
      "API / endpoint - implement.",
      "API / endpoint - write and run its tests after implementation.",
      "Frontend behavior - implement.",
      "Frontend behavior - write and run its tests after implementation.",
      "Environment/build configuration.",
      "Documentation and traceability."
    ]
  },
  "input_sha256": "sha256:5abe4623326503897de1f88a07216f4db4a4dcda4a57598cf3b9cf656620a191",
  "contract_sha256": "sha256:f3feae0909914fc677bbf78f7e29176db155e1dba2bfbdb4f60e387397b4f620"
}
```
