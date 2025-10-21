// src/routes/authRoutes.js
//Autoria do IZIDIO


const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth'); // Para manipular loggedUsers
const loggedUsers = authMiddleware.loggedUsers;

// --- Ponto de Atenção 1: Importar o Controller de Autenticação Real ---
// Substitua o mock pelo import real assim que o Controller for criado.
// Exemplo: const authController = require('../controllers/authController');
const authController = { 
    login: (req, res) => {
        const { username, password } = req.body;
        if(username === 'admin' && password === 'admin'){
            const token = "token-admin"; // Mock de token
            loggedUsers.add(token);
            return res.json({ message: "Login bem-sucedido", token });
        } else {
            return res.status(401).json({ error: "Usuário ou senha inválidos" });
        }
    },
    logout: (req, res) => {
        const token = req.headers['authorization'];
        if(token && loggedUsers.has(token)){
            loggedUsers.delete(token);
            return res.json({ message: "Logout realizado com sucesso" });
        }
        return res.status(400).json({ error: "Token inválido ou usuário não logado" });
    },
    status: (req, res) => {
        const token = req.headers['authorization'];
        if(token && loggedUsers.has(token)){
            return res.json({ message: "Usuário logado" });
        }
        return res.status(401).json({ error: "Usuário não logado" });
    }
};

// =================================================================
// ROTAS DE AUTENTICAÇÃO (/api/auth)
// =================================================================

// [POST] /api/auth/login
// Objetivo: Autenticar o usuário.
//Implementado por pedro izidio
router.post('/login', authController.login);



// [POST] /api/auth/logout
// Objetivo: Finalizar a sessão/invalidar o token.
router.post('/logout', authController.logout);

// [GET] /api/auth/status
// Objetivo: Verificar se o usuário está logado e o token é válido.
router.get('/status', authController.status); 

module.exports = router;
