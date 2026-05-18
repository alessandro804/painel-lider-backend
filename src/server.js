// ===================================================================
// SERVIDOR BACKEND - LIDER COMMERCE
// ===================================================================
// Backend Express que:
//  1. Valida as regras de negocio antes de gravar
//  2. Intermedia o painel ERP com o Supabase
//  3. Protege as chaves (Supabase e marketplaces) no servidor
// ===================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const autenticar = require('./middleware/autenticar');
const rotasAuth = require('./routes/auth');
const rotasProdutos = require('./routes/produtos');
const rotasPromocoes = require('./routes/promocoes');
const rotasLojas = require('./routes/lojas');

const app = express();
const PORT = process.env.PORT || 3001;

// --- CORS: so aceita requisicoes dos dominios autorizados ---
const origensPermitidas = (process.env.CORS_ORIGINS || '')
  .split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // permite ferramentas locais (sem origin) e os dominios da lista
    if (!origin || origensPermitidas.length === 0 || origensPermitidas.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origem nao autorizada pelo CORS.'));
    }
  },
}));

// --- Body parser: aceita JSON ate 10mb (fotos em base64 podem ser grandes) ---
app.use(express.json({ limit: '10mb' }));

// --- Rota de saude (nao precisa de token - serve para testar se esta no ar) ---
app.get('/health', (req, res) => {
  res.json({ ok: true, servico: 'backend-lider', hora: new Date().toISOString() });
});

// --- Login: NAO exige o token de API (senao ninguem conseguiria logar) ---
app.use('/api/auth', rotasAuth);

// --- A partir daqui, TUDO exige o token de acesso ---
app.use('/api', autenticar);

// --- Rotas protegidas ---
app.use('/api/produtos', rotasProdutos);
app.use('/api/promocoes', rotasPromocoes);
app.use('/api/lojas', rotasLojas);

// --- Rota nao encontrada ---
app.use((req, res) => {
  res.status(404).json({ ok: false, erro: 'Rota nao encontrada.' });
});

// --- Tratamento de erros geral ---
app.use((err, req, res, next) => {
  console.error('Erro:', err.message);
  res.status(500).json({ ok: false, erro: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log('===========================================');
  console.log('  Backend Lider Commerce no ar!');
  console.log('  Porta: ' + PORT);
  console.log('  Teste: http://localhost:' + PORT + '/health');
  console.log('===========================================');
});
