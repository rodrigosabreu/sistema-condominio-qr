#!/bin/bash

# Script para criar a estrutura de projetos .NET seguindo Clean Architecture
# Baseado nas especificações do AGENTS.md

set -e

echo "🚀 Criando estrutura de projetos SistemaCondominio..."

# Criar solução
echo "📦 Criando solução..."
dotnet new sln -n SistemaCondominio

# Criar projetos
echo "📁 Criando projetos..."
dotnet new webapi -n SistemaCondominio.Api -o backend/src/SistemaCondominio.Api
dotnet new classlib -n SistemaCondominio.Domain -o backend/src/SistemaCondominio.Domain
dotnet new classlib -n SistemaCondominio.Application -o backend/src/SistemaCondominio.Application
dotnet new classlib -n SistemaCondominio.Infrastructure -o backend/src/SistemaCondominio.Infrastructure
dotnet new classlib -n SistemaCondominio.Auth -o backend/src/SistemaCondominio.Auth

# Criar projetos de teste
echo "🧪 Criando projetos de teste..."
dotnet new xunit -n SistemaCondominio.UnitTests -o tests/SistemaCondominio.UnitTests
dotnet new xunit -n SistemaCondominio.IntegrationTests -o tests/SistemaCondominio.IntegrationTests

# Adicionar projetos à solução
echo "🔗 Adicionando projetos à solução..."
dotnet sln add backend/src/SistemaCondominio.Api/SistemaCondominio.Api.csproj
dotnet sln add backend/src/SistemaCondominio.Domain/SistemaCondominio.Domain.csproj
dotnet sln add backend/src/SistemaCondominio.Application/SistemaCondominio.Application.csproj
dotnet sln add backend/src/SistemaCondominio.Infrastructure/SistemaCondominio.Infrastructure.csproj
dotnet sln add backend/src/SistemaCondominio.Auth/SistemaCondominio.Auth.csproj
dotnet sln add tests/SistemaCondominio.UnitTests/SistemaCondominio.UnitTests.csproj
dotnet sln add tests/SistemaCondominio.IntegrationTests/SistemaCondominio.IntegrationTests.csproj

# Adicionar referências entre projetos (Clean Architecture)
echo "🔗 Adicionando referências entre projetos..."
dotnet add backend/src/SistemaCondominio.Api reference backend/src/SistemaCondominio.Application backend/src/SistemaCondominio.Auth
dotnet add backend/src/SistemaCondominio.Application reference backend/src/SistemaCondominio.Domain
dotnet add backend/src/SistemaCondominio.Infrastructure reference backend/src/SistemaCondominio.Domain
dotnet add backend/src/SistemaCondominio.Auth reference backend/src/SistemaCondominio.Domain

# Adicionar referências de teste
dotnet add tests/SistemaCondominio.UnitTests reference backend/src/SistemaCondominio.Application
dotnet add tests/SistemaCondominio.IntegrationTests reference backend/src/SistemaCondominio.Api

# Instalar pacotes NuGet
echo "📦 Instalando pacotes NuGet..."

# Infrastructure
dotnet add backend/src/SistemaCondominio.Infrastructure package Microsoft.EntityFrameworkCore.Design
dotnet add backend/src/SistemaCondominio.Infrastructure package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add backend/src/SistemaCondominio.Infrastructure package QRCoder

# API
dotnet add backend/src/SistemaCondominio.Api package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add backend/src/SistemaCondominio.Api package SendGrid.Extensions.DependencyInjection
dotnet add backend/src/SistemaCondominio.Api package Serilog.AspNetCore
dotnet add backend/src/SistemaCondominio.Api package Asp.Versioning.Http

# Application
dotnet add backend/src/SistemaCondominio.Application package FluentValidation
dotnet add backend/src/SistemaCondominio.Application package AutoMapper

# Tests
dotnet add tests/SistemaCondominio.UnitTests package Moq
dotnet add tests/SistemaCondominio.UnitTests package FluentAssertions

# Restaurar dependências
echo "🔄 Restaurando dependências..."
dotnet restore

# Criar diretórios adicionais
echo "📁 Criando diretórios adicionais..."
mkdir -p backend/src/SistemaCondominio.Api/Controllers
mkdir -p backend/src/SistemaCondominio.Api/Middleware
mkdir -p backend/src/SistemaCondominio.Domain/Entities
mkdir -p backend/src/SistemaCondominio.Domain/Enums
mkdir -p backend/src/SistemaCondominio.Domain/Interfaces
mkdir -p backend/src/SistemaCondominio.Application/DTOs
mkdir -p backend/src/SistemaCondominio.Application/Services
mkdir -p backend/src/SistemaCondominio.Application/Validators
mkdir -p backend/src/SistemaCondominio.Infrastructure/Data
mkdir -p backend/src/SistemaCondominio.Infrastructure/Repositories
mkdir -p backend/src/SistemaCondominio.Infrastructure/ExternalServices
mkdir -p backend/src/SistemaCondominio.Auth/Services

echo "✅ Estrutura de projetos criada com sucesso!"
echo ""
echo "📝 Próximos passos:"
echo "1. Configure appsettings.Development.json com suas credenciais"
echo "2. Suba o banco de dados: docker-compose up -d"
echo "3. Crie o DbContext em Infrastructure/Data"
echo "4. Rode: dotnet ef migrations add InitialCreate --project backend/src/SistemaCondominio.Infrastructure --startup-project backend/src/SistemaCondominio.Api"
echo "5. Rode: dotnet ef database update --project backend/src/SistemaCondominio.Infrastructure --startup-project backend/src/SistemaCondominio.Api"
echo "6. Rode a API: dotnet run --project backend/src/SistemaCondominio.Api"
