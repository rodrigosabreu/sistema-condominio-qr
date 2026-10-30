# CI Pipeline — Redesign Frontend

Pipeline de CI proposto para o projeto (GitHub Actions, `.github/workflows/ci.yml`).

## Artefatos consumidos

- `build-and-test-summary` (upstream: build-and-test)
- `build-test-results` (upstream: build-and-test)
- `build-instructions.md` (upstream: build-and-test)
- `code-summary` e `code-generation-plan.md` (upstream: code-generation)

## Pipeline proposto

```yaml
name: CI
on: [push, pull_request]
jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm, cache-dependency-path: frontend/package-lock.json }
      - run: npm ci
        working-directory: frontend
      - run: npm run typecheck
        working-directory: frontend
      - run: npm run build
        working-directory: frontend
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with: { dotnet-version: 8.x }
      - run: dotnet build backend/SistemaCondominio.slnx
```

## Status
Proposto — arquivo `.github/workflows/ci.yml` ainda não criado no repo
(aguardando aprovação do humano para materializar).

<!-- re-saved after summary confirmation -->
