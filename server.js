//usando a biblioteca dotenv do nodejs para carregar variaveis de ambiente
require('dotenv').config();
const app = require('./src/app'); //poderia setar aqui as rotas, mas preferi deixar no app.js

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Acesse sua perdição em http://localhost:${PORT}`);
}); //Futuramente poderia adicionar os outros endereços que o servidor poderia rodar
