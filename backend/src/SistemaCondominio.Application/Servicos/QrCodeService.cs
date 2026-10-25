using Microsoft.EntityFrameworkCore;
using SistemaCondominio.Application.Abstracoes;
using SistemaCondominio.Application.Dtos;
using SistemaCondominio.Domain.Entities;

namespace SistemaCondominio.Application.Servicos;

public class QrCodeService(IAplicacaoDbContext db)
{
    public async Task<QrCodeRespostaDto> ObterPublicoAsync(Guid qrCodeId, string? ip, string? userAgent, string caminho)
    {
        var qrCode = await db.QrCodes.Include(q => q.Local).FirstOrDefaultAsync(q => q.Id == qrCodeId && q.Ativo);
        if (qrCode?.Local is not { Ativo: true } local)
            throw new NaoEncontradoException("QR Code não encontrado");

        var nomeCondominio = await db.Condominios.Where(c => c.Id == local.CondominioId).Select(c => c.Nome).FirstOrDefaultAsync();
        var servicos = await db.Servicos.Where(s => s.LocalId == local.Id).OrderByDescending(s => s.CriadoEm).Take(20).ToListAsync();

        qrCode.Visualizacoes++;
        db.RegistrosAcesso.Add(new RegistroAcesso
        {
            QrCodeId = qrCode.Id,
            CondominioId = local.CondominioId,
            Endpoint = caminho.Truncar(300)!,
            Metodo = "GET",
            CodigoResposta = 200,
            IpAddress = ip.Truncar(45),
            UserAgent = userAgent.Truncar(500),
            Anonimo = true
        });
        await db.SalvarAlteracoesAsync();

        return new QrCodeRespostaDto(
            new LocalPublicoDto(local.Id, local.Nome, local.Tipo, qrCode.Id, local.CondominioId, nomeCondominio, qrCode.Visualizacoes),
            servicos.Select(s => s.ParaDto() with { UsuarioId = null }).ToList());
    }
}
