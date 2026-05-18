// ===================================================================
// REGRAS DE NEGOCIO - AUTENTICACAO (apenas login)
// ===================================================================

// Confere se o e-mail tem formato valido
function emailValido(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Valida os dados de um LOGIN
function validarLogin(dados) {
  const erros = [];
  if (!emailValido(dados.email)) {
    erros.push('Informe um e-mail valido.');
  }
  if (!dados.senha || typeof dados.senha !== 'string') {
    erros.push('A senha e obrigatoria.');
  }
  return { valido: erros.length === 0, erros };
}

module.exports = { validarLogin, emailValido };
