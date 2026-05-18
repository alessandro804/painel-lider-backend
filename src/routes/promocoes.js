// ===================================================================
// ROTAS - PROMOCOES
// ===================================================================

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { validarPromocao } = require('../validators/promocao');

const TABELA = 'promocoes';

// GET /api/promocoes
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from(TABELA).select('*');
    if (error) throw error;
    res.json({ ok: true, promocoes: data });
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
});

// POST /api/promocoes - cria (VALIDA)
router.post('/', async (req, res) => {
  const { valido, erros } = validarPromocao(req.body);
  if (!valido) {
    return res.status(400).json({ ok: false, erro: 'Dados invalidos.', detalhes: erros });
  }
  try {
    const { data, error } = await supabase
      .from(TABELA).insert([req.body]).select().single();
    if (error) throw error;
    res.status(201).json({ ok: true, promocao: data });
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
});

// PUT /api/promocoes/:id - atualiza (VALIDA)
router.put('/:id', async (req, res) => {
  const { valido, erros } = validarPromocao(req.body);
  if (!valido) {
    return res.status(400).json({ ok: false, erro: 'Dados invalidos.', detalhes: erros });
  }
  try {
    const { data, error } = await supabase
      .from(TABELA).update(req.body).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json({ ok: true, promocao: data });
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
});

// DELETE /api/promocoes/:id
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.from(TABELA).delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
});

module.exports = router;
