// ===================================================================
// REGRAS DE NEGOCIO - PRODUTOS
// ===================================================================
// Estas validacoes espelham o que o painel ERP espera.
// Toda requisicao de criar/editar produto passa por aqui ANTES do banco.
// Validacao no backend = seguranca (o front tambem valida, mas para UX).
// ===================================================================

// Limites e constantes (ajuste conforme a necessidade do negocio)
const LIMITES = {
  NOME_MIN: 3,
  NOME_MAX: 120,
  SKU_MAX: 60,
  DESCRICAO_MAX: 5000,
  PRECO_MIN: 0.01,        // preco minimo: 1 centavo
  PESO_MIN: 0,
  STATUS_VALIDOS: ['ativo', 'inativo', 'rascunho', 'excluido'],
  MODELOS_PRECO: ['variacao', 'unico'],
};

// Limites de fotos POR MARKETPLACE (cada um tem sua regra).
// Estes limites so sao checados na hora de EXPORTAR, nao ao salvar o produto.
const LIMITES_FOTOS = {
  // Shopee: max 9 fotos no produto, 1 foto por variacao
  shopee: { fotosProduto: 9, fotosPorVariacao: 1, fotosPorVariacaoMax: 1 },
  // Mercado Livre: fotos por variacao - o total pode passar de 9
  mercadolivre: { fotosProduto: null, fotosPorVariacao: null, fotosPorVariacaoMax: 10 },
  // TikTok: ate 9 imagens principais no produto
  tiktok: { fotosProduto: 9, fotosPorVariacao: null, fotosPorVariacaoMax: 9 },
  // Shein: ainda a confirmar quando integrarmos
  shein: { fotosProduto: 9, fotosPorVariacao: null, fotosPorVariacaoMax: 9 },
};

// Valida os dados de um produto.
// Retorna { valido: bool, erros: [string] }
function validarProduto(dados) {
  const erros = [];

  // --- Nome ---
  if (!dados.nome || typeof dados.nome !== 'string' || !dados.nome.trim()) {
    erros.push('O nome do produto e obrigatorio.');
  } else {
    const nome = dados.nome.trim();
    if (nome.length < LIMITES.NOME_MIN) {
      erros.push(`O nome deve ter pelo menos ${LIMITES.NOME_MIN} caracteres.`);
    }
    if (nome.length > LIMITES.NOME_MAX) {
      erros.push(`O nome pode ter no maximo ${LIMITES.NOME_MAX} caracteres.`);
    }
  }

  // --- SKU pai ---
  if (dados.skuPai && String(dados.skuPai).length > LIMITES.SKU_MAX) {
    erros.push(`O SKU pode ter no maximo ${LIMITES.SKU_MAX} caracteres.`);
  }

  // --- Preco ---
  const preco = parseFloat(dados.preco);
  if (dados.preco === undefined || dados.preco === null || isNaN(preco)) {
    erros.push('O preco e obrigatorio e deve ser um numero.');
  } else if (preco < LIMITES.PRECO_MIN) {
    erros.push(`O preco deve ser maior ou igual a R$ ${LIMITES.PRECO_MIN.toFixed(2)}.`);
  }

  // --- Peso ---
  if (dados.peso !== undefined && dados.peso !== null && dados.peso !== '') {
    const peso = parseFloat(dados.peso);
    if (isNaN(peso) || peso < LIMITES.PESO_MIN) {
      erros.push('O peso deve ser um numero maior ou igual a zero.');
    }
  }

  // --- Descricao ---
  if (dados.descricao && String(dados.descricao).length > LIMITES.DESCRICAO_MAX) {
    erros.push(`A descricao pode ter no maximo ${LIMITES.DESCRICAO_MAX} caracteres.`);
  }

  // --- Status ---
  if (dados.status && !LIMITES.STATUS_VALIDOS.includes(dados.status)) {
    erros.push(`Status invalido. Use: ${LIMITES.STATUS_VALIDOS.join(', ')}.`);
  }

  // --- Modelo de preco ---
  if (dados.modeloPreco && !LIMITES.MODELOS_PRECO.includes(dados.modeloPreco)) {
    erros.push(`Modelo de preco invalido. Use: ${LIMITES.MODELOS_PRECO.join(', ')}.`);
  }

  // --- Loja ---
  if (!dados.lojaId) {
    erros.push('O produto precisa estar vinculado a uma loja.');
  }

  // --- Fotos ---
  // O produto pode ter quantas fotos precisar. O limite de cada
  // marketplace e checado so na hora de exportar (ver validarProdutoParaExport).
  if (dados.fotos !== undefined && !Array.isArray(dados.fotos)) {
    erros.push('O campo de fotos deve ser uma lista.');
  }

  // --- Variacoes ---
  if (dados.variacoes !== undefined) {
    if (!Array.isArray(dados.variacoes)) {
      erros.push('O campo de variacoes deve ser uma lista.');
    } else {
      dados.variacoes.forEach((v, i) => {
        const erroVar = validarVariacao(v, i + 1);
        erros.push(...erroVar);
      });
    }
  }

  return { valido: erros.length === 0, erros };
}

// Valida uma variacao de produto.
function validarVariacao(variacao, numero) {
  const erros = [];
  const prefixo = `Variacao ${numero}:`;

  if (!variacao.nome || !String(variacao.nome).trim()) {
    erros.push(`${prefixo} o nome da variacao e obrigatorio.`);
  }
  if (!variacao.sku || !String(variacao.sku).trim()) {
    erros.push(`${prefixo} o SKU da variacao e obrigatorio.`);
  }
  // Estoque: numero inteiro >= 0
  if (variacao.estoque !== undefined && variacao.estoque !== null && variacao.estoque !== '') {
    const estoque = parseInt(variacao.estoque);
    if (isNaN(estoque) || estoque < 0) {
      erros.push(`${prefixo} o estoque deve ser um numero inteiro maior ou igual a zero.`);
    }
  }
  // Preco da variacao: se informado, >= minimo
  if (variacao.preco !== undefined && variacao.preco !== null && variacao.preco !== '') {
    const preco = parseFloat(variacao.preco);
    if (isNaN(preco) || preco < LIMITES.PRECO_MIN) {
      erros.push(`${prefixo} o preco da variacao deve ser maior ou igual a R$ ${LIMITES.PRECO_MIN.toFixed(2)}.`);
    }
  }
  return erros;
}

// Valida as fotos do produto conforme a regra de cada marketplace.
// Retorna lista de erros (vazia se estiver tudo certo).
function validarFotosParaMarketplace(produto, marketplace) {
  const erros = [];
  const regra = LIMITES_FOTOS[marketplace];
  if (!regra) return erros;

  const fotosProduto = (produto.fotos || []).length;
  const variacoes = produto.variacoes || [];

  // --- Limite de fotos no produto ---
  if (regra.fotosProduto !== null && fotosProduto > regra.fotosProduto) {
    erros.push(
      `${marketplace}: o produto tem ${fotosProduto} fotos, mas o limite e ${regra.fotosProduto}.`
    );
  }

  // --- Shopee: exige exatamente 1 foto por variacao ---
  if (regra.fotosPorVariacao === 1) {
    variacoes.forEach((v, i) => {
      const fotosVar = (v.fotos || []).length;
      // se a variacao nao tem foto propria, a Shopee usa a do produto - ok
      if (fotosVar > 1) {
        erros.push(
          `${marketplace}: a variacao "${v.nome || (i + 1)}" tem ${fotosVar} fotos; ` +
          `a Shopee aceita apenas 1 por variacao.`
        );
      }
    });
  }

  // --- Marketplaces com fotos por variacao (ex: Mercado Livre) ---
  // Aqui o total pode passar de 9. So checamos o teto por variacao.
  if (regra.fotosPorVariacaoMax) {
    variacoes.forEach((v, i) => {
      const fotosVar = (v.fotos || []).length;
      if (fotosVar > regra.fotosPorVariacaoMax) {
        erros.push(
          `${marketplace}: a variacao "${v.nome || (i + 1)}" tem ${fotosVar} fotos, ` +
          `mas o limite por variacao e ${regra.fotosPorVariacaoMax}.`
        );
      }
    });
  }

  return erros;
}

// ===================================================================
// REGRAS DE EXPORTACAO POR MARKETPLACE
// Valida se um produto esta pronto para ser exportado.
// ===================================================================
function validarProdutoParaExport(produto, marketplace) {
  const erros = [];

  // Regras comuns a todos os marketplaces
  if (!produto.nome) erros.push('Nome do produto.');
  if (!produto.skuPai) erros.push('SKU pai.');
  if (!produto.preco || parseFloat(produto.preco) < LIMITES.PRECO_MIN) {
    erros.push('Preco base valido.');
  }
  if (!produto.fotos || produto.fotos.length === 0) {
    erros.push('Pelo menos 1 foto.');
  }
  if (!produto.categoria) erros.push('Categoria interna.');

  // Validacao de fotos conforme a regra do marketplace
  erros.push(...validarFotosParaMarketplace(produto, marketplace));

  // --- Shopee ---
  if (marketplace === 'shopee') {
    if (!produto.peso || parseFloat(produto.peso) <= 0) {
      erros.push('Peso do produto (a Shopee exige).');
    }
  }

  // --- Mercado Livre ---
  if (marketplace === 'mercadolivre') {
    const modeloNovo = (produto.modeloPreco || 'variacao') === 'variacao';
    if (!produto.variacoes || produto.variacoes.length === 0) {
      erros.push('Pelo menos uma variacao (o ML exige).');
    }
    if (modeloNovo && (!produto.guiaTamanhos || !produto.guiaTamanhos.linhas || produto.guiaTamanhos.linhas.length === 0)) {
      erros.push('Guia de tamanhos (obrigatorio no modelo novo do Mercado Livre).');
    }
  }

  // --- TikTok Shop ---
  if (marketplace === 'tiktok') {
    if (!produto.variacoes || produto.variacoes.length === 0) {
      erros.push('Pelo menos uma variacao/SKU (o TikTok exige).');
    }
    if (!produto.peso || parseFloat(produto.peso) <= 0) {
      erros.push('Peso do pacote (o TikTok exige).');
    }
    const temGuia = produto.guiaTamanhos && (
      produto.guiaTamanhos.imagemUrl ||
      (produto.guiaTamanhos.linhas && produto.guiaTamanhos.linhas.length > 0)
    );
    if (!temGuia) {
      erros.push('Guia de tamanhos (o TikTok exige - texto ou imagem).');
    }
  }

  return { valido: erros.length === 0, erros };
}

module.exports = {
  validarProduto,
  validarVariacao,
  validarProdutoParaExport,
  validarFotosParaMarketplace,
  LIMITES,
  LIMITES_FOTOS,
};
