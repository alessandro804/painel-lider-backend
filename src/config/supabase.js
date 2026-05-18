// ===================================================================
// CONEXAO COM O SUPABASE
// ===================================================================
// O backend usa a chave SERVICE ROLE - a poderosa.
// Ela fica SO aqui no servidor, nunca no painel.
// ===================================================================

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('ERRO: SUPABASE_URL e SUPABASE_SERVICE_KEY precisam estar no .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

module.exports = supabase;
