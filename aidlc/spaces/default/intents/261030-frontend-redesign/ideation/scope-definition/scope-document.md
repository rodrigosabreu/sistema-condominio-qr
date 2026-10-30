# Scope Document

**Source**: [intent-statement](./intent-capture/intent-statement.md)

## Scope Boundary

### In Scope
- Redesign completo do visual do frontend (pasta frontend/), mantendo React 19 + Vite + Tailwind 4 e toda a lógica de negócio, rotas, autenticação e integração com a API .NET [desc]
- Novo design system com:
  - Paleta de cores moderna
  - Tipografia consistente
  - Componentes reutilizáveis
- Aplicado em todas as páginas:
  - Login
  - Painel
  - Condomínios
  - Locais
  - Serviços
  - Usuários
  - QrPublico

### Out of Scope
- Novas funcionalidades [Q8]
- Suporte a outros idiomas [Q8]
- Modo escuro [Q8]
- Animações complexas [Q8]
- Alterações na lógica de negócio [desc]
- Mudanças nas rotas [desc]
- Mudanças na autenticação [desc]
- Mudanças na integração com a API .NET [desc]

## Constraints
- Manter React 19 + Vite + Tailwind 4 [Q9]
- Manter toda a lógica de negócio existente [Q9]
- Manter todas as rotas existentes [Q9]
- Manter autenticação JWT [Q9]
- Manter integração com API .NET [Q9]

---

## Assumptions & Open Questions

None.