// Teste das regras de negocio do backend
const { validarProduto, validarProdutoParaExport } = require('./src/validators/produto');
const { validarPromocao } = require('./src/validators/promocao');
const { validarLoja, validarGuiaTamanho } = require('./src/validators/loja');

let passou = 0, falhou = 0;
function check(n, c) { if(c){passou++;console.log('  OK   | '+n);}else{falhou++;console.log(' FALHA | '+n);} }

console.log('=== TESTE: Regras de negocio do backend ===\n');

// ===== PRODUTO =====
// 1. Produto valido
let r = validarProduto({ nome:'Tenis Runner X', skuPai:'TEN-001', preco:199.90, lojaId:'L1' });
check('Produto valido passa', r.valido === true);

// 2. Nome obrigatorio
r = validarProduto({ preco:100, lojaId:'L1' });
check('Sem nome: rejeitado', r.valido === false);

// 3. Nome curto demais
r = validarProduto({ nome:'AB', preco:100, lojaId:'L1' });
check('Nome com 2 letras: rejeitado', r.valido === false);

// 4. Nome longo demais
r = validarProduto({ nome:'X'.repeat(121), preco:100, lojaId:'L1' });
check('Nome com 121 letras: rejeitado', r.valido === false);

// 5. Preco abaixo de 1 centavo
r = validarProduto({ nome:'Produto', preco:0, lojaId:'L1' });
check('Preco zero: rejeitado', r.valido === false);
r = validarProduto({ nome:'Produto', preco:0.005, lojaId:'L1' });
check('Preco abaixo de 1 centavo: rejeitado', r.valido === false);
r = validarProduto({ nome:'Produto', preco:0.01, lojaId:'L1' });
check('Preco de exatamente 1 centavo: aceito', r.valido === true);

// 6. Sem loja
r = validarProduto({ nome:'Produto', preco:100 });
check('Sem loja: rejeitado', r.valido === false);

// 7. Fotos: o produto pode ter quantas fotos quiser (limite e por marketplace)
r = validarProduto({ nome:'Produto', preco:100, lojaId:'L1', fotos: new Array(15).fill('f') });
check('15 fotos no produto: aceito (limite e por marketplace)', r.valido === true);
r = validarProduto({ nome:'Produto', preco:100, lojaId:'L1', fotos: 'naoEhLista' });
check('Fotos que nao sao lista: rejeitado', r.valido === false);

// 8. Status invalido
r = validarProduto({ nome:'Produto', preco:100, lojaId:'L1', status:'qualquer' });
check('Status invalido: rejeitado', r.valido === false);

// 9. Variacao sem SKU
r = validarProduto({ nome:'Produto', preco:100, lojaId:'L1',
  variacoes:[{ nome:'Preto 40' }] });
check('Variacao sem SKU: rejeitado', r.valido === false);

// 10. Variacao com estoque negativo
r = validarProduto({ nome:'Produto', preco:100, lojaId:'L1',
  variacoes:[{ nome:'Preto 40', sku:'P-40', estoque:-5 }] });
check('Variacao com estoque negativo: rejeitado', r.valido === false);

// ===== EXPORTACAO =====
// 11. Shopee exige peso
r = validarProdutoParaExport(
  { nome:'P', skuPai:'S', preco:100, fotos:['f'], categoria:'Tenis', peso:0 }, 'shopee');
check('Export Shopee sem peso: pendencia', r.valido === false);

// 12. ML exige guia de tamanhos no modelo novo
r = validarProdutoParaExport(
  { nome:'P', skuPai:'S', preco:100, fotos:['f'], categoria:'Tenis',
    modeloPreco:'variacao', variacoes:[{sku:'v1'}] }, 'mercadolivre');
check('Export ML sem guia: pendencia', r.valido === false);

// 13. TikTok exige guia (texto ou imagem)
r = validarProdutoParaExport(
  { nome:'P', skuPai:'S', preco:100, fotos:['f'], categoria:'Tenis',
    peso:0.5, variacoes:[{sku:'v1'}] }, 'tiktok');
check('Export TikTok sem guia: pendencia', r.valido === false);

// 14. Produto completo para TikTok
r = validarProdutoParaExport(
  { nome:'P', skuPai:'S', preco:100, fotos:['f'], categoria:'Tenis',
    peso:0.5, variacoes:[{sku:'v1'}],
    guiaTamanhos:{ imagemUrl:'http://img.png' } }, 'tiktok');
check('Export TikTok completo: pronto', r.valido === true);

// ===== FOTOS POR MARKETPLACE =====
const { validarFotosParaMarketplace } = require('./src/validators/produto');

// Shopee: max 9 fotos no produto
let ef = validarFotosParaMarketplace({ fotos: new Array(10).fill('f'), variacoes:[] }, 'shopee');
check('Shopee com 10 fotos: erro', ef.length > 0);
ef = validarFotosParaMarketplace({ fotos: new Array(9).fill('f'), variacoes:[] }, 'shopee');
check('Shopee com 9 fotos: ok', ef.length === 0);

// Shopee: 1 foto por variacao
ef = validarFotosParaMarketplace({ fotos:['f'],
  variacoes:[{ nome:'Preto 40', fotos:['a','b'] }] }, 'shopee');
check('Shopee variacao com 2 fotos: erro', ef.length > 0);
ef = validarFotosParaMarketplace({ fotos:['f'],
  variacoes:[{ nome:'Preto 40', fotos:['a'] }] }, 'shopee');
check('Shopee variacao com 1 foto: ok', ef.length === 0);

// Mercado Livre: total pode passar de 9 (fotos por variacao)
ef = validarFotosParaMarketplace({
  fotos: new Array(6).fill('f'),
  variacoes:[
    { nome:'Preto 40', fotos: new Array(5).fill('a') },
    { nome:'Preto 41', fotos: new Array(5).fill('b') }
  ]
}, 'mercadolivre');
check('ML com 16 fotos no total (por variacao): ok', ef.length === 0);

// ML: so reclama se uma variacao passar do teto alto
ef = validarFotosParaMarketplace({
  fotos:[], variacoes:[{ nome:'Preto 40', fotos: new Array(11).fill('a') }]
}, 'mercadolivre');
check('ML variacao com 11 fotos: erro (passou do teto)', ef.length > 0);


// ===== PROMOCAO =====
// 15. Promocao valida
r = validarPromocao({ nome:'Liquida Verao', tipo:'promocao', desconto:20,
  descTipo:'percentual', lojaId:'L1' });
check('Promocao valida passa', r.valido === true);

// 16. Cupom sem codigo
r = validarPromocao({ nome:'Cupom X', tipo:'cupom', desconto:10, lojaId:'L1' });
check('Cupom sem codigo: rejeitado', r.valido === false);

// 17. Desconto percentual acima de 100
r = validarPromocao({ nome:'Erro', tipo:'promocao', desconto:150,
  descTipo:'percentual', lojaId:'L1' });
check('Desconto de 150%: rejeitado', r.valido === false);

// 18. Data inicio depois do fim
r = validarPromocao({ nome:'Erro', tipo:'promocao', desconto:10,
  descTipo:'percentual', lojaId:'L1', inicio:'2026-12-31', fim:'2026-01-01' });
check('Inicio depois do fim: rejeitado', r.valido === false);

// ===== LOJA =====
// 19. Loja valida
r = validarLoja({ nome:'Loja Shopee', marketplace:'shopee' });
check('Loja valida passa', r.valido === true);

// 20. Marketplace invalido
r = validarLoja({ nome:'Loja X', marketplace:'amazon' });
check('Marketplace invalido: rejeitado', r.valido === false);

// ===== GUIA =====
// 21. Guia sem linhas
r = validarGuiaTamanho({ nome:'Guia', lojaId:'L1', colunas:['Tamanho'], linhas:[] });
check('Guia sem linhas: rejeitado', r.valido === false);

// 22. Guia valido
r = validarGuiaTamanho({ nome:'Guia 34-40', lojaId:'L1',
  colunas:['Tamanho','CM'], linhas:[{Tamanho:'34',CM:'22'}] });
check('Guia valido passa', r.valido === true);

console.log(`\n=== RESULTADO: ${passou} passou, ${falhou} falhou ===`);
process.exit(falhou > 0 ? 1 : 0);
