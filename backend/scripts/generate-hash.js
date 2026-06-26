const bcrypt = require('bcryptjs');

const senha = 'COLOQUE_SUA_SENHA_AQUI';
const hash = bcrypt.hashSync(senha, 10);

console.log('Cole isso no seu .env como PASSWORD_HASH:');
console.log(hash);