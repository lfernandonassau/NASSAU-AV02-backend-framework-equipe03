// src/routes/authRoutes.js

const express = require('express');
const router = express.Router();

// --- Ponto de Atenção 1: Importar o Controller de Autenticação Real ---
// Substitua o mock pelo import real assim que o Controller for criado.
// Exemplo: const authController = require('../controllers/authController');
const authController = { 
    login: (req, res) => res.json({ message: "Rota: POST /api/auth/login - Pronto para Login" }),
    logout: (req, res) => res.json({ message: "Rota: POST /api/auth/logout - Pronto para Logout" }),
    status: (req, res) => res.json({ message: "Rota: GET /api/auth/status - Pronto para checar Status" }),
    // ... Aqui iriam outras funções como 'register' ou 'forgotPassword' se fossem necessárias.
};

// --- Ponto de Atenção 2: Adicionar um Middleware de Autenticação (Futuro) ---
// Em rotas que exigem login (como 'status'), você adicionará um middleware aqui.
// Exemplo: router.get('/status', authMiddleware, authController.status);

// =================================================================
// ROTAS DE AUTENTICAÇÃO (/api/auth)
// =================================================================

// [POST] /api/auth/login
// Objetivo: Autenticar o usuário.
router.post('/login', authController.login);

// [POST] /api/auth/logout
// Objetivo: Finalizar a sessão/invalidar o token.
router.post('/logout', authController.logout);

// [GET] /api/auth/status
// Objetivo: Verificar se o usuário está logado e o token é válido.
router.get('/status', authController.status); 

module.exports = router;