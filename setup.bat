@echo off
REM Script para criar a estrutura de projetos .NET seguindo Clean Architecture
REM Baseado nas especificações do AGENTS.md

echo 🚀 Criando estrutura de projetos SistemaCondominio...

REM Criar solução
echo 📦 Criando solução...
dotnet new sln -n SistemaCondominio

REM Criar projetos
echo 📁 Criando projetos...
dotnet new webapi -n SistemaCondominio.Api -o backend\backend\src\SistemaCondominio.Api
dotnet new classlib -n SistemaCondominio.Domain -o backend\backend\src\SistemaCondominio.Domain
dotnet new classlib -n SistemaCondominio.Application -o backend\backend\src\SistemaCondominio.Application
dotnet new classlib -n SistemaCondominio.Infrastructure -o backend\backend\src\SistemaCondominio.Infrastructure
dotnet new classlib -n SistemaCondominio.Auth -o backend\backend\src\SistemaCondominio.Auth

REM Criar projetos de teste
echo 🧪 Criando projetos de teste...
dotnet new xunit -n SistemaCondominio.UnitTests -o tests\SistemaCondominio.UnitTests
dotnet new xunit -n SistemaCondominio.IntegrationTests -o tests\SistemaCondominio.IntegrationTests

REM Adicionar projetos à solução
echo 🔗 Adicionando projetos à solução...
dotnet sln add backend\backend\src\SistemaCondominio.Api\SistemaCondominio.Api.csproj
dotnet sln add backend\backend\src\SistemaCondominio.Domain\SistemaCondominio.Domain.csproj
dotnet sln add backend\backend\src\SistemaCondominio.Application\SistemaCondominio.Application.csproj
dotnet sln add backend\backend\src\SistemaCondominio.Infrastructure\SistemaCondominio.Infrastructure.csproj
dotnet sln add backend\backend\src\SistemaCondominio.Auth\SistemaCondominio.Auth.csproj
dotnet sln add tests\SistemaCondominio.UnitTests\SistemaCondominio.UnitTests.csproj
dotnet sln add tests\SistemaCondominio.IntegrationTests\SistemaCondominio.IntegrationTests.csproj

REM Adicionar referências entre projetos (Clean Architecture)
echo 🔗 Adicionando referências entre projetos...
dotnet add backend\backend\src\SistemaCondominio.Api reference backend\backend\src\SistemaCondominio.Application backend\backend\src\SistemaCondominio.Auth
dotnet add backend\backend\src\SistemaCondominio.Application reference backend\backend\src\SistemaCondominio.Domain
dotnet add backend\backend\src\SistemaCondominio.Infrastructure reference backend\backend\src\SistemaCondominio.Domain
dotnet add backend\backend\src\SistemaCondominio.Auth reference backend\backend\src\SistemaCondominio.Domain

REM Adicionar referências de teste
dotnet add tests\SistemaCondominio.UnitTests reference backend\backend\src\SistemaCondominio.Application
dotnet add tests\SistemaCondominio.IntegrationTests reference backend\backend\src\SistemaCondominio.Api

REM Instalar pacotes NuGet
echo 📦 Instalando pacotes NuGet...

REM Infrastructure
dotnet add backend\src\SistemaCondominio.Infrastructure package Microsoft.EntityFrameworkCore.Design
dotnet add backend\src\SistemaCondominio.Infrastructure package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add backend\src\SistemaCondominio.Infrastructure package QRCoder

REM API
dotnet add backend\src\SistemaCondominio.Api package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add backend\src\SistemaCondominio.Api package SendGrid.Extensions.DependencyInjection
dotnet add backend\src\SistemaCondominio.Api package Serilog.AspNetCore
dotnet add backend\src\SistemaCondominio.Api package Asp.Versioning.Http

REM Application
dotnet add backend\src\SistemaCondominio.Application package FluentValidation
dotnet add backend\src\SistemaCondominio.Application package AutoMapper

REM Tests
dotnet add tests\SistemaCondominio.UnitTests package Moq
dotnet add tests\SistemaCondominio.UnitTests package FluentAssertions

REM Restaurar dependências
echo 🔄 Restaurando dependências...
dotnet restore

REM Criar diretórios adicionais
echo 📁 Criando diretórios adicionais...
if not exist "backend\src\SistemaCondominio.Api\Controllers" mkdir "backend\src\SistemaCondominio.Api\Controllers"
if not exist "backend\src\SistemaCondominio.Api\Middleware" mkdir "backend\src\SistemaCondominio.Api\Middleware"
if not exist "backend\src\SistemaCondominio.Domain\Entities" mkdir "backend\src\SistemaCondominio.Domain\Entities"
if not exist "backend\src\SistemaCondominio.Domain\Enums" mkdir "backend\src\SistemaCondominio.Domain\Enums"
if not exist "backend\src\SistemaCondominio.Domain\Interfaces" mkdir "backend\src\SistemaCondominio.Domain\Interfaces"
if not exist "backend\src\SistemaCondominio.Application\DTOs" mkdir "backend\src\SistemaCondominio.Application\DTOs"
if not exist "backend\src\SistemaCondominio.Application\Services" mkdir "backend\src\SistemaCondominio.Application\Services"
if not exist "backend\src\SistemaCondominio.Application\Validators" mkdir "backend\src\SistemaCondominio.Application\Validators"
if not exist "backend\src\SistemaCondominio.Infrastructure\Data" mkdir "backend\src\SistemaCondominio.Infrastructure\Data"
if not exist "backend\src\SistemaCondominio.Infrastructure\Repositories" mkdir "backend\src\SistemaCondominio.Infrastructure\Repositories"
if not exist "backend\src\SistemaCondominio.Infrastructure\ExternalServices" mkdir "backend\src\SistemaCondominio.Infrastructure\ExternalServices"
if not exist "backend\src\SistemaCondominio.Auth\Services" mkdir "backend\src\SistemaCondominio.Auth\Services"

echo.
echo ✅ Estrutura de projetos criada com sucesso!
echo.
echo 📝 Próximos passos:
echo 1. Configure appsettings.Development.json com suas credenciais
echo 2. Suba o banco de dados: docker-compose up -d
echo 3. Crie o DbContext em Infrastructure\Data
echo 4. Rode: dotnet ef migrations add InitialCreate --project backend\src\SistemaCondominio.Infrastructure --startup-project backend\src\SistemaCondominio.Api
echo 5. Rode: dotnet ef database update --project backend\src\SistemaCondominio.Infrastructure --startup-project backend\src\SistemaCondominio.Api
echo 6. Rode a API: dotnet run --project backend\src\SistemaCondominio.Api
echo.

pause
