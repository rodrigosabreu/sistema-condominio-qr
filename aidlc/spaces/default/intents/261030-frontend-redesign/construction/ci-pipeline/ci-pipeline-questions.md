# CI Pipeline — Perguntas

## Q1. Qual ferramenta de CI está em uso?
A. AWS CodePipeline/CodeBuild
B. GitHub Actions
C. Jenkins
D. GitLab CI
E. Outro (especifique)
[Answer]: B. GitHub Actions

## Q2. Qual é a estratégia de branches?
A. GitFlow (develop + feature branches)
B. Trunk-based em main
C. Feature branches com PR para main
D. Outro (especifique)
[Answer]: B. Trunk-based em main

## Q3. Quais quality gates são exigidos antes do merge?
A. Typecheck + build (front e backend)
B. A + testes unitários
C. B + cobertura mínima
D. Nenhum gate obrigatório
E. Outro (especifique)
[Answer]: A. Typecheck + build (front e backend)

## Q4. Quais repositórios de artefatos são usados?
A. AWS ECR/CodeArtifact/S3
B. GitHub Packages/registry npm
C. Nenhum (projeto de curso, sem artefatos publicados)
D. Outro (especifique)
[Answer]: C. Nenhum

## Assumptions & Open Questions

None.

## Consolidated Summary Confirmation

- CI: GitHub Actions
- Branches: trunk-based em main
- Gates: typecheck + build (front e backend)
- Artefatos: nenhum (projeto de curso)

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
