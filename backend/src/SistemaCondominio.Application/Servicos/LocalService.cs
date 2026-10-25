using Microsoft.EntityFrameworkCore;
using QRCoder;
using SistemaCondominio.Application.Abstracoes;
using SistemaCondominio.Application.Dtos;
using SistemaCondominio.Domain.Entities;

namespace SistemaCondominio.Application.Servicos;

public class LocalService(IAplicacaoDbContext db)
{
    public async Task<IReadOnlyList<LocalResumoDto>> ListarAsync(EscopoUsuario escopo, bool incluirInativos = false)
    {
        var consulta = db.Locais.Where(l => l.QrCode != null);
        if (!(incluirInativos && escopo.EhAdministrador))
            consulta = consulta.Where(l => l.Ativo);
        if (!escopo.Geral)
            consulta = consulta.Where(l => l.CondominioId == escopo.CondominioId);

        return await consulta
            .OrderBy(l => l.Nome)
            .Select(l => new LocalResumoDto(l.Id, l.CondominioId, l.Nome, l.Tipo, l.Andar, l.Ativo, l.QrCode!.Id))
            .ToListAsync();
    }

    public async Task<LocalDetalheDto> ObterAsync(Guid localId, EscopoUsuario escopo)
    {
        escopo.ValidarAdministrador();
        var local = await BuscarAsync(localId);
        escopo.ValidarCondominio(local.CondominioId);
        return local.ParaDetalhe();
    }

    public async Task<LocalDetalheDto> CriarAsync(LocalRequest request, EscopoUsuario escopo)
    {
        escopo.ValidarAdministrador();

        var condominioId = escopo.ResolverCondominio(request.CondominioId);
        if (!await db.Condominios.AnyAsync(c => c.Id == condominioId))
            throw new NaoEncontradoException("Condomínio não encontrado");

        var local = new Local
        {
            CondominioId = condominioId,
            Nome = Validacao.Obrigatorio(request.Nome, "Nome do local", 200),
            Tipo = request.Tipo,
            Andar = request.Andar,
            Ativo = request.Ativo,
            QrCode = new QrCode { CondominioId = condominioId }
        };
        db.Locais.Add(local);
        await db.SalvarAlteracoesAsync();

        return local.ParaDetalhe();
    }

    public async Task<LocalDetalheDto> AtualizarAsync(Guid localId, LocalRequest request, EscopoUsuario escopo)
    {
        escopo.ValidarAdministrador();

        var local = await BuscarAsync(localId);
        escopo.ValidarCondominio(local.CondominioId);
        if (request.CondominioId is { } destino && destino != local.CondominioId)
            throw new ValidacaoException("Não é possível mover o local para outro condomínio");

        local.Nome = Validacao.Obrigatorio(request.Nome, "Nome do local", 200);
        local.Tipo = request.Tipo;
        local.Andar = request.Andar;
        local.Ativo = request.Ativo;
        await db.SalvarAlteracoesAsync();

        return local.ParaDetalhe();
    }

    public async Task<byte[]> GerarQrCodePngAsync(Guid localId, EscopoUsuario escopo, string urlBase)
    {
        escopo.ValidarAdministrador();

        var local = await BuscarAsync(localId);
        escopo.ValidarCondominio(local.CondominioId);
        if (local.QrCode is null)
            throw new NaoEncontradoException("Este local não possui QR Code");

        using var gerador = new QRCodeGenerator();
        using var dados = gerador.CreateQrCode($"{urlBase.TrimEnd('/')}/{local.QrCode.Id}", QRCodeGenerator.ECCLevel.Q);
        return new PngByteQRCode(dados).GetGraphic(20);
    }

    private async Task<Local> BuscarAsync(Guid localId) =>
        await db.Locais.Include(l => l.QrCode).FirstOrDefaultAsync(l => l.Id == localId)
            ?? throw new NaoEncontradoException("Local não encontrado");
}
