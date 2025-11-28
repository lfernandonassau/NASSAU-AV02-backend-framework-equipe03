// src/routes/usuarioRoutes.js
// RESPONSÁVEL: izidio
// Rotas relacionadas aos usuários

import express from 'express';
import { 
  listarUsuarios, 
  criarUsuario, 
  atualizarUsuario, 
  deletarUsuario,
  buscarUsuarioPorId
} from '../controllers/usuarioController.js';

import { authMiddleware } from '../middleware/authMiddleware.js'
import { adminMiddleware } from '../middleware/adminMiddleware.js'
import { rateLimit } from '../middleware/rateLimitMiddleware.js'

const router = express.Router();

// CRUD Usuário 
router.get('/', authMiddleware, adminMiddleware, rateLimit(10, 'minutos'), listarUsuarios);          // /Usuarios → lista todas
router.get('/:id', authMiddleware, rateLimit(20, 'minutos'), buscarUsuarioPorId);   // /Usuarios/:id → busca por ID
router.post('/', authMiddleware, adminMiddleware, rateLimit(5, 'minutos'), criarUsuario);                           // /Usuarios → cria Usuarios
router.put('/:id', authMiddleware, rateLimit(5, 'minutos'), atualizarUsuario);     // /Usuarios/:id → atualiza Usuarios
router.delete('/:id', authMiddleware, adminMiddleware, rateLimit(2, 'minutos'), deletarUsuario);   // /Usuarios/:id → exclui Usuarios

export default router;