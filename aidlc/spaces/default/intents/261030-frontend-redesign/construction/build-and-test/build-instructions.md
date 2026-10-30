# Build Instructions — Redesign Frontend

## Pré-requisitos
- Node.js 18+ e npm
- Backend .NET (API) em `http://localhost:5234` para dados reais (opcional para build)

## Comandos
```bash
cd frontend
npm install        # primeira vez
npm run typecheck  # tsc --noEmit
npm run build      # tsc --noEmit && vite build -> dist/
npm run dev        # dev server :5173 (proxy /api -> :5234)
```

## Resultado esperado
- typecheck: 0 erros
- build: `dist/` com index.html + assets (JS ~311 kB, CSS ~29 kB)

## Artefatos consumidos

- `code-generation-plan.md` (upstream: code-generation)
- `unit-test-instructions.md` (upstream: code-generation) — instruções de
  teste previstas pelo contrato; não executadas neste estágio pois o
  projeto não possui test runner (decisão aprovada pelo humano no gate
  de conclusão do code-generation).
- `code-summary.md` (upstream: code-generation)
