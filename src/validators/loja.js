// ===================================================================
// REGRAS DE NEGOCIO - LOJAS E GUIAS DE TAMANHO
// ===================================================================

const MARKETPLACES_VALIDOS = ['shopee', 'mercadolivre', 'tiktok', 'shein'];

// --- LOJA ---
function validarLoja(dados) {
  const erros = [];

  if (!dados.nome || !String(dados.nome).trim()) {
    erros.push('O nome da loja e obrigatorio.');
  } else if (dados.nome.trim().length > 80) {
    erros.push('O nome da loja pode ter no maximo 80 caracteres.');
  }

  if (!dados.marketplace || !MARKETPLACES_VALIDOS.includes(dados.marketplace)) {
    erros.push(`Marketplace invalido. Use: ${MARKETPLACES_VALIDOS.join(', ')}.`);
  }

  return { valido: erros.length === 0, erros };
}

// --- GUIA DE TAMANHO ---
function validarGuiaTamanho(dados) {
  const erros = [];

  if (!dados.nome || !String(dados.nome).trim()) {
    erros.push('O guia precisa de um nome.');
  }

  if (!dados.lojaId) {
    erros.push('O guia precisa estar vinculado a uma loja.');
  }

  if (!Array.isArray(dados.colunas) || dados.colunas.length === 0) {
    erros.push('O guia precisa ter pelo menos uma coluna.');
  }

  if (!Array.isArray(dados.linhas) || dados.linhas.length === 0) {
    erros.push('O guia precisa ter pelo menos uma linha (tamanho).');
  }

  return { valido: erros.length === 0, erros };
}

// --- VINCULO DE CATEGORIA (De-Para) ---
function validarCategoriaMap(dados) {
  const erros = [];

  if (!dados.categoriaInterna || !String(dados.categoriaInterna).trim()) {
    erros.push('A categoria interna e obrigatoria.');
  }

  // vinculos e um objeto { shopee: '...', mercadolivre: '...', ... }
  if (dados.vinculos && typeof dados.vinculos !== 'object') {
    erros.push('Os vinculos devem ser um objeto.');
  }

  return { valido: erros.length === 0, erros };
}

module.exports = {
  validarLoja,
  validarGuiaTamanho,
  validarCategoriaMap,
  MARKETPLACES_VALIDOS,
};
