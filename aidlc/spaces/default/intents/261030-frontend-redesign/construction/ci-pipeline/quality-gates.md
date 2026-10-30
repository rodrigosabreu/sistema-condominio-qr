# Quality Gates — CI

| Gate | Ferramenta | Bloqueia merge? | Status |
|---|---|---|---|
| Typecheck frontend | `tsc --noEmit` | Sim | Ativo (verde local) |
| Build frontend | `vite build` | Sim | Ativo (verde local) |
| Build backend | `dotnet build` | Sim | Ativo |
| Lint | a definir (ESLint não configurado) | Não | Pendente |
| Testes unitários | a definir (sem runner) | Não | Dívida aceita (R-01) |
| Cobertura 80% | a definir | Não | Dívida aceita (R-01) |

Gates mínimos recomendados para já: typecheck + build do front e build do
backend, conforme `build-instructions.md` e `code-summary.md` (upstream).
Testes ficam como melhoria futura registrada em `test-results.md`.

<!-- re-saved after summary confirmation -->
