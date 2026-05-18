// ===================================================================
// REGRAS DE NEGOCIO - PROMOCOES
// ===================================================================

const LIMITES_PROMO = {
  NOME_MIN: 3,
  NOME_MAX: 120,
  CODIGO_MAX: 30,
  TIPOS: ['promocao', 'relampago', 'cupom'],
  TIPOS_DESCONTO: ['percentual', 'valor'],
  STATUS: ['agendada', 'ativa', 'encerrada'],
  ALVOS: ['todos', 'categoria', 'produtos'],
  DESCONTO_PERCENTUAL_MAX: 100,
};

function validarPromocao(dados) {
  const erros = [];

  // --- Nome ---
  if (!dados.nome || !String(dados.nome).trim()) {
    erros.push('O nome da promocao e obrigatorio.');
  } else {
    const nome = dados.nome.trim();
    if (nome.length < LIMITES_PROMO.NOME_MIN) {
      erros.push(`O nome deve ter pelo menos ${LIMITES_PROMO.NOME_MIN} caracteres.`);
    }
    if (nome.length > LIMITES_PROMO.NOME_MAX) {
      erros.push(`O nome pode ter no maximo ${LIMITES_PROMO.NOME_MAX} caracteres.`);
    }
  }

  // --- Tipo ---
  if (!dados.tipo || !LIMITES_PROMO.TIPOS.includes(dados.tipo)) {
    erros.push(`Tipo invalido. Use: ${LIMITES_PROMO.TIPOS.join(', ')}.`);
  }

  // --- Cupom precisa de codigo ---
  if (dados.tipo === 'cupom') {
    if (!dados.codigo || !String(dados.codigo).trim()) {
      erros.push('Cupom precisa de um codigo.');
    } else if (String(dados.codigo).length > LIMITES_PROMO.CODIGO_MAX) {
      erros.push(`O codigo do cupom pode ter no maximo ${LIMITES_PROMO.CODIGO_MAX} caracteres.`);
    }
  }

  // --- Tipo de desconto ---
  if (dados.descTipo && !LIMITES_PROMO.TIPOS_DESCONTO.includes(dados.descTipo)) {
    erros.push(`Tipo de desconto invalido. Use: ${LIMITES_PROMO.TIPOS_DESCONTO.join(', ')}.`);
  }

  // --- Valor do desconto ---
  const desconto = parseFloat(dados.desconto);
  if (isNaN(desconto) || desconto <= 0) {
    erros.push('O desconto deve ser um numero maior que zero.');
  } else if (dados.descTipo === 'percentual' && desconto > LIMITES_PROMO.DESCONTO_PERCENTUAL_MAX) {
    erros.push('O desconto percentual nao pode passar de 100%.');
  }

  // --- Status ---
  if (dados.status && !LIMITES_PROMO.STATUS.includes(dados.status)) {
    erros.push(`Status invalido. Use: ${LIMITES_PROMO.STATUS.join(', ')}.`);
  }

  // --- Alvo ---
  if (dados.alvo && !LIMITES_PROMO.ALVOS.includes(dados.alvo)) {
    erros.push(`Alvo invalido. Use: ${LIMITES_PROMO.ALVOS.join(', ')}.`);
  }

  // --- Datas ---
  if (dados.inicio && dados.fim) {
    if (dados.inicio > dados.fim) {
      erros.push('A data de inicio nao pode ser depois da data de fim.');
    }
  }

  // --- Loja ---
  if (!dados.lojaId) {
    erros.push('A promocao precisa estar vinculada a uma loja.');
  }

  return { valido: erros.length === 0, erros };
}

module.exports = { validarPromocao, LIMITES_PROMO };
