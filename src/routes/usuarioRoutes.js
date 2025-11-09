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

const router = express.Router();

// CRUD Usuário 
router.get('/', authMiddleware, listarUsuarios);          // /Usuarios → lista todas
router.get('/:id', authMiddleware, buscarUsuarioPorId);   // /Usuarios/:id → busca por ID
router.post('/', criarUsuario);                           // /Usuarios → cria Usuarios
router.put('/:id', authMiddleware, atualizarUsuario);     // /Usuarios/:id → atualiza Usuarios
router.delete('/:id', authMiddleware, deletarUsuario);    // /Usuarios/:id → exclui Usuarios

export default router;
