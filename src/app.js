const express = require('express'); //importando o express
const app = express(); //criando a aplicação (instância)

//region Middlewares
const logger = require('./middlewares/logger'); //middleware para logar todas as requisições #CT
const auth = require('./middlewares/auth'); //middleware global de autenticação #CT
const segurarErros = require('./middlewares/segurarErros'); //middleware de captura de erros #CT
//endregion

//CONFIGURAÇÕES GLOBAIS DO APP
app.use(express.json()); //habilitando o express para receber json
app.use(logger); // loga todas as requisições usando o middleware de logger #CT
app.use(auth); // autenticação global usando o middleware de auth #CT

// =================================================================
// ROTAS DA API
// =================================================================
// URGENT: JAMAIS ADICIONE OUTRAS ROTAS AQUI.
// Para adicionar outras rotas, importe um arquivo de rotas
// Exemplo: const userRoutes = require('./routes/userRoutes');
// app.use('/users', userRoutes);

const authRoutes = require('./routes/authRoutes'); //rotas de autenticação #IZIDIO
const containersRoutes = require('./routes/containersRoutes'); //rotas de containers #IZIDIO
const itemsRoutes = require('./routes/itemsRoutes'); //rotas de items #IZIDIO

app.use('/api/auth', authRoutes); //rotas de autenticação #IZIDIO
app.use('/api/containers', containersRoutes); //rotas de containers #IZIDIO
app.use('/api/items', itemsRoutes); //rotas de items #IZIDIO

// --- ROTA RAIZ ("/") PARA ORIENTAR LOGIN #IZIDIO
app.get('/', (req, res) => {
    res.json({
        message: "Bem-vindo à API ItemTify! Para usar as rotas, faça login enviando POST para /api/auth/login com JSON { username: 'admin', password: 'admin' }"
    });
});

// MIDDLEWARE DE CAPTURA DE ERROS SEMPRE POR ÚLTIMO #CT
app.use(segurarErros);

module.exports = app;
