// ===================================================================
// ROTAS - PRODUTOS
// ===================================================================
// Aqui as regras de negocio sao aplicadas ANTES de tocar no banco.
// ===================================================================

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { validarProduto, validarProdutoParaExport } = require('../validators/produto');

const TABELA = 'produtos';

// GET /api/produtos - lista todos os produtos
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from(TABELA).select('*');
    if (error) throw error;
    res.json({ ok: true, produtos: data });
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
});

// GET /api/produtos/:id - busca um produto
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABELA).select('*').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ ok: false, erro: 'Produto nao encontrado.' });
    res.json({ ok: true, produto: data });
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
});

// POST /api/produtos - cria um produto (VALIDA as regras de negocio)
router.post('/', async (req, res) => {
  // 1. Valida as regras de negocio
  const { valido, erros } = validarProduto(req.body);
  if (!valido) {
    return res.status(400).json({ ok: false, erro: 'Dados invalidos.', detalhes: erros });
  }

  // 2. So entao grava no banco
  try {
    const { data, error } = await supabase
      .from(TABELA).insert([req.body]).select().single();
    if (error) throw error;
    res.status(201).json({ ok: true, produto: data });
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
});

// PUT /api/produtos/:id - atualiza um produto (VALIDA tambem)
router.put('/:id', async (req, res) => {
  const { valido, erros } = validarProduto(req.body);
  if (!valido) {
    return res.status(400).json({ ok: false, erro: 'Dados invalidos.', detalhes: erros });
  }

  try {
    const { data, error } = await supabase
      .from(TABELA).update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ ok: true, produto: data });
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
});

// DELETE /api/produtos/:id - move para a lixeira (nao apaga de verdade)
router.delete('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABELA).update({ status: 'excluido' }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ ok: true, produto: data });
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
});

// POST /api/produtos/:id/validar-export - checa se esta pronto para exportar
router.post('/:id/validar-export', async (req, res) => {
  const marketplace = req.body.marketplace;
  if (!marketplace) {
    return res.status(400).json({ ok: false, erro: 'Informe o marketplace.' });
  }
  try {
    const { data: produto, error } = await supabase
      .from(TABELA).select('*').eq('id', req.params.id).single();
    if (error) throw error;
    if (!produto) return res.status(404).json({ ok: false, erro: 'Produto nao encontrado.' });

    const resultado = validarProdutoParaExport(produto, marketplace);
    res.json({ ok: true, prontoParaExport: resultado.valido, pendencias: resultado.erros });
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
});

module.exports = router;
