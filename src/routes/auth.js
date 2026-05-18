// ===================================================================
// ROTAS - AUTENTICACAO (apenas login)
// ===================================================================
// Sistema de usuario unico. Nao ha registro publico.
// A senha fica no banco como HASH bcrypt (nunca a senha pura).
// O login devolve um TOKEN JWT que o painel usa nas proximas requisicoes.
// ===================================================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { validarLogin } = require('../validators/auth');

const TABELA = 'usuarios';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRA = process.env.JWT_EXPIRA || '7d';

// Gera o token de login
function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, nome: usuario.nome },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRA }
  );
}

// -------------------------------------------------------------------
// POST /api/auth/login - faz login e devolve o token
// -------------------------------------------------------------------
router.post('/login', async (req, res) => {
  // 1. Valida o formato dos dados
  const { valido, erros } = validarLogin(req.body);
  if (!valido) {
    return res.status(400).json({ ok: false, erro: 'Dados invalidos.', detalhes: erros });
  }

  const email = req.body.email.trim().toLowerCase();
  const senha = req.body.senha;

  try {
    // 2. Busca o usuario pelo e-mail
    const { data: usuario } = await supabase
      .from(TABELA).select('*').eq('email', email).maybeSingle();

    // Mensagem generica de proposito: nao revela se o e-mail existe ou nao
    if (!usuario) {
      return res.status(401).json({ ok: false, erro: 'E-mail ou senha incorretos.' });
    }

    // 3. Compara a senha digitada com o hash guardado
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ ok: false, erro: 'E-mail ou senha incorretos.' });
    }

    // 4. Login OK - gera o token e devolve
    const token = gerarToken(usuario);
    res.json({
      ok: true,
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    });
  } catch (err) {
    res.status(500).json({ ok: false, erro: 'Erro interno ao fazer login.' });
  }
});

// -------------------------------------------------------------------
// GET /api/auth/verificar - confere se um token ainda e valido
// O painel chama isto ao abrir, para saber se o login ainda vale.
// -------------------------------------------------------------------
router.get('/verificar', (req, res) => {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, erro: 'Token ausente.' });
  }

  try {
    const dados = jwt.verify(token, JWT_SECRET);
    res.json({ ok: true, usuario: { id: dados.id, nome: dados.nome, email: dados.email } });
  } catch (err) {
    res.status(401).json({ ok: false, erro: 'Token invalido ou expirado.' });
  }
});

module.exports = router;
