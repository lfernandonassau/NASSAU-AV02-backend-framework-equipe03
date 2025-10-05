const express = require('express'); //importando o express
const app = express(); //criando a aplicação (instância)

app.use(express.json()); //habilitando o express para receber json

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
}); //middleware simples para logar as requisições (pega todas e dá um console.log)
//eu poderia adicionar cores ou um sistema de logger melhor no futuro


app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
}); //rota de teste
// URGENT: JAMAIS ADICIONE OUTRAS ROTAS AQUI.
// Para adicionar outras rotas, importe um arquivo de rotas
// Ex:
// const userRoutes = require('./routes/userRoutes');
// app.use('/users', userRoutes);

module.exports = app;
