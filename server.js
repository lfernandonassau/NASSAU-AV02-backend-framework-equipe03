//carregando variáveis do .env
require('dotenv').config();

const express = require('express');
const app = express();

//se não existir, avisa que não existe, pro fulaninho ir lá e configurar
if (!process.env.PORT) {
  console.log(
    'ERRO: A variável de ambiente PORT não está definida no arquivo .env!\n' +
    'Copie o arquivo .env.example para .env e defina a porta antes de rodar o servidor.'
  );
  process.exit(1); //encerra o processo (crasha o nodemon)
}

//pega a porta e passa pra constante (só pra usar depois sem ter que ficar chamando process.env.PORT toda hora)
const PORT = process.env.PORT;

app.get('/', (req, res) => {
  res.send('Olá, mundo!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
