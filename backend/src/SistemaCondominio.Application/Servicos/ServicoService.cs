using Microsoft.EntityFrameworkCore;
using SistemaCondominio.Application.Abstracoes;
using SistemaCondominio.Application.Dtos;
using SistemaCondominio.Domain.Entities;
using SistemaCondominio.Domain.Enums;

namespace SistemaCondominio.Application.Servicos;

public class ServicoService(IAplicacaoDbContext db)
{
    public async Task<ServicosPorLocalDto> ListarPorLocalAsync(Guid localId, int pagina, int tamanho, EscopoUsuario escopo)
    {
        pagina = Math.Clamp(pagina, 1, 10_000);
        tamanho = tamanho is < 1 or > 100 ? 20 : tamanho;

        var local = await db.Locais.Include(l => l.QrCode).FirstOrDefaultAsync(l => l.Id == localId)
            ?? throw new NaoEncontradoException("Local não encontrado");
        escopo.ValidarCondominio(local.CondominioId);

        var consulta = db.Servicos.Where(s => s.LocalId == localId);
        var total = await consulta.CountAsync();
        var servicos = await consulta.OrderByDescending(s => s.CriadoEm).Skip((pagina - 1) * tamanho).Take(tamanho).ToListAsync();
        var ultimo = await consulta.Where(s => s.Status == StatusServico.Concluido).OrderByDescending(s => s.ConcluidoEm).FirstOrDefaultAsync();
        var interrupcao = await consulta.Where(s => s.Status == StatusServico.Interrompido).OrderByDescending(s => s.CriadoEm).FirstOrDefaultAsync();
        var proximo = await consulta.Where(s => s.Status == StatusServico.Agendado && s.AgendadoEm != null).OrderBy(s => s.AgendadoEm).FirstOrDefaultAsync();

        return new ServicosPorLocalDto(
            new LocalResumoDto(local.Id, local.CondominioId, local.Nome, local.Tipo, local.Andar, local.Ativo, local.QrCode?.Id),
            new StatusAtualDto(
                ultimo is null ? null : new ResumoUltimoServicoDto(ultimo.Tipo, ultimo.ConcluidoEm, ultimo.Responsavel),
                interrupcao?.ParaDto(),
                proximo is null ? null : new ProximoServicoDto(proximo.Tipo, proximo.AgendadoEm)),
            servicos.Select(s => s.ParaDto()).ToList(),
            new PaginacaoDto(pagina, tamanho, total, (int)Math.Ceiling((double)total / tamanho)));
    }

    public async Task<ServicoDto> RegistrarAsync(RegistrarServicoRequest request, EscopoUsuario escopo)
    {
        if (string.IsNullOrWhiteSpace(request.Descricao))
            throw new ValidacaoException("A descrição do serviço é obrigatória");
        if (request.Descricao.Length > 1000)
            throw new ValidacaoException("A descrição deve ter no máximo 1000 caracteres");
        if (request.Responsavel?.Length > 200)
            throw new ValidacaoException("O responsável deve ter no máximo 200 caracteres");

        var local = await db.Locais.FirstOrDefaultAsync(l => l.Id == request.LocalId)
            ?? throw new NaoEncontradoException("Local não encontrado");
        escopo.ValidarCondominio(local.CondominioId);

        if (!await db.Usuarios.AnyAsync(u => u.Id == escopo.UsuarioId && u.Ativo))
            throw new AcessoNegadoException("Usuário não autorizado");

        var servico = new Servico
        {
            LocalId = local.Id,
            UsuarioId = escopo.UsuarioId,
            Tipo = request.Tipo,
            Descricao = request.Descricao,
            Responsavel = request.Responsavel,
            Observacoes = request.Observacoes,
            AgendadoEm = request.AgendadoEm,
            Status = StatusServico.Agendado
        };
        db.Servicos.Add(servico);
        await db.SalvarAlteracoesAsync();

        return servico.ParaDto();
    }

    public async Task<ServicoDto> AtualizarAsync(Guid servicoId, AtualizarServicoRequest request, EscopoUsuario escopo)
    {
        var servico = await db.Servicos.Include(s => s.Local).FirstOrDefaultAsync(s => s.Id == servicoId)
            ?? throw new NaoEncontradoException("Serviço não encontrado");
        escopo.ValidarCondominio(servico.Local!.CondominioId);

        if (escopo.Papel == PapelUsuario.UsuarioComum && servico.UsuarioId != escopo.UsuarioId)
            throw new AcessoNegadoException("Você só pode editar serviços que você registrou");

        servico.Tipo = request.Tipo;
        servico.Descricao = Validacao.Obrigatorio(request.Descricao, "Descrição", 1000);
        servico.Responsavel = Validacao.Opcional(request.Responsavel, "Responsável", 200);
        servico.Observacoes = Validacao.Opcional(request.Observacoes, "Observações", 2000);
        servico.AgendadoEm = request.AgendadoEm;
        await db.SalvarAlteracoesAsync();

        return servico.ParaDto();
    }

    public async Task<ServicoDto> ConcluirAsync(Guid servicoId, string? observacoes, EscopoUsuario escopo)
    {
        var servico = await db.Servicos.Include(s => s.Local).FirstOrDefaultAsync(s => s.Id == servicoId)
            ?? throw new NaoEncontradoException("Serviço não encontrado");
        escopo.ValidarCondominio(servico.Local!.CondominioId);

        if (escopo.Papel == PapelUsuario.UsuarioComum && servico.UsuarioId != escopo.UsuarioId)
            throw new AcessoNegadoException("Você só pode concluir serviços que você registrou");
        if (servico.Status == StatusServico.Concluido)
            throw new ValidacaoException("Este serviço já foi concluído");

        servico.Status = StatusServico.Concluido;
        servico.ConcluidoEm = DateTime.UtcNow;
        servico.Observacoes = observacoes ?? servico.Observacoes;
        await db.SalvarAlteracoesAsync();

        return servico.ParaDto();
    }
}
