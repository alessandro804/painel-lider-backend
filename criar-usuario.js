// ===================================================================
// SCRIPT - GERAR O USUARIO DE LOGIN
// ===================================================================
// Como o sistema e de uso unico, este script gera o SQL para criar
// o seu usuario no Supabase, com a senha ja criptografada (hash bcrypt).
//
// COMO USAR:
//   1. Rode:  node criar-usuario.js
//   2. Ele vai imprimir um comando SQL
//   3. Cole esse SQL no Supabase (SQL Editor) e execute
//
// Para mudar o e-mail/senha, edite as duas linhas abaixo e rode de novo.
// ===================================================================

const bcrypt = require('bcryptjs');

// >>> EDITE AQUI o seu e-mail e senha <<<
const EMAIL = 'alessandro@lidercommerce.com';
const SENHA = 'Lider@2026';
const NOME  = 'Alessandro';

// Gera o hash da senha (custo 10 - padrao seguro)
const hash = bcrypt.hashSync(SENHA, 10);

console.log('\n===================================================');
console.log(' USUARIO DE LOGIN - LIDER COMMERCE');
console.log('===================================================');
console.log(' E-mail:', EMAIL);
console.log(' Senha :', SENHA, '  (troque depois do primeiro acesso)');
console.log('===================================================\n');
console.log('Cole o SQL abaixo no Supabase (SQL Editor) e execute:\n');
console.log('-- 1. Cria a tabela de usuarios (se ainda nao existir)');
console.log(`CREATE TABLE IF NOT EXISTS usuarios (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT now()
);`);
console.log('\n-- 2. Insere o seu usuario');
console.log(`INSERT INTO usuarios (nome, email, senha_hash)
VALUES ('${NOME}', '${EMAIL}', '${hash}')
ON CONFLICT (email) DO UPDATE SET senha_hash = EXCLUDED.senha_hash;`);
console.log('\n===================================================\n');
