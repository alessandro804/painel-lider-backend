# Backend Lider Commerce

Backend Express que intermedeia o painel ERP, o Supabase e os marketplaces.

## O que este backend faz

1. **Valida as regras de negocio** antes de gravar qualquer coisa (nome, preco, fotos, etc.)
2. **Protege as chaves** - a chave service role do Supabase e as chaves dos marketplaces ficam so aqui no servidor
3. **Intermedia** o painel e o Supabase - o painel nunca mais fala direto com o banco

## Arquitetura

```
Painel HTML  --HTTP-->  Backend Express  -->  Supabase (banco)
                        (valida tudo aqui)
```

## Estrutura de pastas

```
backend-lider/
  src/
    server.js              -> servidor principal, junta tudo
    config/
      supabase.js          -> conexao com o Supabase
    middleware/
      autenticar.js        -> exige token em toda requisicao
    validators/            -> AS REGRAS DE NEGOCIO ficam aqui
      produto.js           -> validacoes de produto e exportacao
      promocao.js          -> validacoes de promocao/cupom
      loja.js              -> validacoes de loja e guia
    routes/                -> os endpoints da API
      produtos.js
      promocoes.js
      lojas.js
  teste-validacoes.js      -> testa as regras de negocio
  package.json
  .env.example             -> modelo de configuracao
```

## Como rodar

1. Instale as dependencias:
   ```
   npm install
   ```

2. Copie o `.env.example` para `.env` e preencha os valores:
   ```
   cp .env.example .env
   ```

3. Rode:
   ```
   npm start
   ```
   ou em modo desenvolvimento (reinicia ao salvar):
   ```
   npm run dev
   ```

4. Teste se esta no ar - abra no navegador:
   ```
   http://localhost:3001/health
   ```

## Como testar as regras de negocio

```
node teste-validacoes.js
node teste-login.js
```

## Criar o usuario de login

O sistema e de uso unico (um login so). Para criar o seu usuario:

```
node criar-usuario.js
```

Ele imprime um comando SQL. Cole no Supabase (SQL Editor) e execute.
Para mudar e-mail/senha, edite as primeiras linhas de `criar-usuario.js` e rode de novo.

A senha NUNCA e guardada pura - vai como hash bcrypt para o banco.

## Endpoints disponiveis

Todos os endpoints (menos /health) exigem o header `x-api-token` com o valor de `API_ACCESS_TOKEN`.

| Metodo | Rota | O que faz |
|--------|------|-----------|
| GET    | /health | Checa se o backend esta no ar (sem token) |
| POST   | /api/auth/login | Faz login, devolve o token (sem token de API) |
| GET    | /api/auth/verificar | Confere se um token de login ainda e valido |
| GET    | /api/produtos | Lista produtos |
| GET    | /api/produtos/:id | Busca um produto |
| POST   | /api/produtos | Cria produto (valida) |
| PUT    | /api/produtos/:id | Atualiza produto (valida) |
| DELETE | /api/produtos/:id | Move para a lixeira |
| POST   | /api/produtos/:id/validar-export | Checa se esta pronto para exportar |
| GET    | /api/promocoes | Lista promocoes |
| POST   | /api/promocoes | Cria promocao (valida) |
| PUT    | /api/promocoes/:id | Atualiza promocao (valida) |
| DELETE | /api/promocoes/:id | Remove promocao |
| GET    | /api/lojas | Lista lojas |
| POST   | /api/lojas | Cria loja (valida) |
| DELETE | /api/lojas/:id | Remove loja (so se nao tiver produtos) |

## Formato das respostas

Sucesso:
```json
{ "ok": true, "produto": { ... } }
```

Erro de validacao (regra de negocio):
```json
{ "ok": false, "erro": "Dados invalidos.", "detalhes": ["O preco deve ser maior ou igual a R$ 0.01."] }
```

## Onde estao as regras de negocio

Tudo na pasta `src/validators/`. Cada arquivo tem as regras de uma entidade.
Para mudar um limite (ex: tamanho maximo do nome), edite a constante `LIMITES`
no topo do arquivo - nao precisa mexer nas rotas.

## Proximos passos (integracoes de marketplace)

As chaves dos marketplaces ja tem lugar reservado no `.env`.
Quando for integrar, crie novas rotas em `src/routes/` (ex: `shopee.js`)
que usam essas chaves para falar com as APIs - as chaves nunca saem do servidor.

## Importante sobre producao

- O backend precisa rodar com HTTPS se o painel estiver em HTTPS (GitHub Pages).
  Uma forma comum: colocar um proxy reverso (nginx, Caddy) na frente.
- Faca backup regular do banco.
- Nunca comite o arquivo `.env` no Git.
