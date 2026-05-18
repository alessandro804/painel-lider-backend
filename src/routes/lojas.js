// ===================================================================
// ROTAS - LOJAS
// ===================================================================

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { validarLoja } = require('../validators/loja');

const TABELA = 'lojas';

// GET /api/lojas
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from(TABELA).select('*');
    if (error) throw error;
    res.json({ ok: true, lojas: data });
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
});

// POST /api/lojas - cria (VALIDA)
router.post('/', async (req, res) => {
  const { valido, erros } = validarLoja(req.body);
  if (!valido) {
    return res.status(400).json({ ok: false, erro: 'Dados invalidos.', detalhes: erros });
  }
  try {
    const { data, error } = await supabase
      .from(TABELA).insert([req.body]).select().single();
    if (error) throw error;
    res.status(201).json({ ok: true, loja: data });
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
});

// DELETE /api/lojas/:id - so remove se nao tiver produtos vinculados
router.delete('/:id', async (req, res) => {
  try {
    // Regra de negocio: loja com produtos nao pode ser removida
    const { data: produtos, error: errProd } = await supabase
      .from('produtos').select('id').eq('lojaId', req.params.id).neq('status', 'excluido');
    if (errProd) throw errProd;

    if (produtos && produtos.length > 0) {
      return res.status(400).json({
        ok: false,
        erro: 'Esta loja tem produtos vinculados e nao pode ser removida.',
      });
    }

    const { error } = await supabase.from(TABELA).delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
});

module.exports = router;
