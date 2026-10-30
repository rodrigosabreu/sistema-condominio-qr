# Instruções de Teste Unitário - Redesign Frontend

**Data:** 2026-10-30  
**Intent:** 261030-frontend-redesign

## Estrutura de Teste

### Componentes UI

Testar cada componente individualmente:

1. **Button.tsx**
   - Renderiza corretamente com texto e ícone
   - Aplica classes corretas para variantes (primary, secondary, ghost, danger)
   - Desabilita quando `disabled={true}`
   - Gera evento `onClick` quando clicado
   - Aplica loading state

2. **Card.tsx**
   - Renderiza children corretamente
   - Aplica estilo glassmorphism
   - Adiciona borda e sombra
   - Suporta variantes (elevated, outlined)

3. **Input.tsx**
   - Renderiza input com label
   - Aplica classes corretas para estados (default, focus, error)
   - Suporta placeholder
   - Suporta disabled
   - Gera eventos onChange

4. **Badge.tsx**
   - Renderiza texto com cor correta
   - Suporta variantes (success, warning, error, info)
   - Aplica padding e borda arredondada

5. **Modal.tsx**
   - Renderiza children dentro do modal
   - Aplica overlay
   - Suporta close button
   - Gera evento onClose

### Páginas

Testar páginas por funcionalidade:

1. **Login.tsx**
   - Renderiza formulário de login
   - Valida email e senha
   - Gera evento de submit
   - Mostra erros de validação

2. **Painel.tsx**
   - Renderiza cards de KPIs
   - Mostra dados corretos
   - Suporta refresh

3. **Condomínios.tsx**
   - Renderiza lista de condomínios
   - Suporta search
   - Mostra modal de criar/editar

### Comandos de Teste

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm test -- --watch

# Executar testes com coverage
npm test -- --coverage
```

## Critérios de Teste

- [ ] 100% de cobertura para componentes UI
- [ ] Testes para estados de loading e error
- [ ] Testes para eventos de user interaction
- [ ] Testes para validação de formulários
- [ ] Testes de responsividade (mobile, tablet, desktop)
