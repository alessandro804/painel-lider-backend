// Teste das validacoes de login
const { validarLogin, emailValido } = require('./src/validators/auth');

let passou = 0, falhou = 0;
function check(n, c) { if(c){passou++;console.log('  OK   | '+n);}else{falhou++;console.log(' FALHA | '+n);} }

console.log('=== TESTE: Login ===\n');

// emailValido
check('E-mail valido aceito', emailValido('alessandro@lider.com') === true);
check('E-mail sem @ rejeitado', emailValido('alessandrolider.com') === false);
check('E-mail sem dominio rejeitado', emailValido('ale@') === false);
check('E-mail vazio rejeitado', emailValido('') === false);
check('E-mail nulo rejeitado', emailValido(null) === false);

// validarLogin
let r = validarLogin({ email:'ale@lider.com', senha:'Lider@2026' });
check('Login valido passa', r.valido === true);

r = validarLogin({ email:'ruim', senha:'123' });
check('E-mail invalido rejeitado', r.valido === false);

r = validarLogin({ email:'ale@lider.com' });
check('Login sem senha rejeitado', r.valido === false);

r = validarLogin({ senha:'123' });
check('Login sem e-mail rejeitado', r.valido === false);

r = validarLogin({});
check('Login vazio rejeitado', r.valido === false);

console.log(`\n=== RESULTADO: ${passou} passou, ${falhou} falhou ===`);
process.exit(falhou > 0 ? 1 : 0);
