// ===================================================================
// MIDDLEWARE DE SEGURANCA
// ===================================================================
// Toda requisicao precisa enviar o token de acesso no header.
// Sem o token correto, a requisicao e barrada antes de chegar nas rotas.
// ===================================================================

const API_ACCESS_TOKEN = process.env.API_ACCESS_TOKEN;

if (!API_ACCESS_TOKEN) {
  console.error('ERRO: API_ACCESS_TOKEN precisa estar no .env');
  process.exit(1);
}

function autenticar(req, res, next) {
  // O painel envia o token no header "x-api-token"
  const token = req.headers['x-api-token'];

  if (!token || token !== API_ACCESS_TOKEN) {
    return res.status(401).json({
      ok: false,
      erro: 'Acesso nao autorizado. Token invalido ou ausente.',
    });
  }

  next();
}

module.exports = autenticar;
