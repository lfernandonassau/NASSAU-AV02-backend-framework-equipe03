// src/routes/locaisRoutes.js
// RESPONSÁVEL: Izídio
// Rotas relacionadas aos locais dos eventos

import express from 'express'
import {
  listarLocais,
  buscarLocalPorId,
  criarLocal,
  atualizarLocal,
  excluirLocal
} from '../controllers/localController.js'

import { authMiddleware } from '../middleware/authMiddleware.js'
import { rateLimit } from '../middleware/rateLimitMiddleware.js'

const router = express.Router()

// CRUD de Locais
router.get('/', authMiddleware, rateLimit(10, 'minutos'), listarLocais)           // /locais → lista todos
router.get('/:id', authMiddleware, rateLimit(20, 'minutos'), buscarLocalPorId)    // /locais/:id → busca por ID
router.post('/', authMiddleware, rateLimit(3, 'minutos'), criarLocal)             // /locais → cria local
router.put('/:id', authMiddleware, rateLimit(5, 'minutos'), atualizarLocal)       // /locais/:id → atualiza local
router.delete('/:id', authMiddleware, rateLimit(2, 'minutos'), excluirLocal)      // /locais/:id → exclui local

export default router