// src/routes/palestrasRoutes.js
// RESPONSÁVEL: Izídio
// Rotas relacionadas às palestras

import express from 'express'
import {
  listarPalestras,
  buscarPalestraPorId,
  criarPalestra,
  atualizarPalestra,
  excluirPalestra
} from '../controllers/palestraController.js'

import { authMiddleware } from '../middleware/authMiddleware.js'
import { rateLimit } from '../middleware/rateLimitMiddleware.js'

const router = express.Router()

// CRUD de Palestras
router.get('/', authMiddleware, rateLimit(10, 'minutos'), listarPalestras)          // /palestras → lista todas
router.get('/:id', authMiddleware, rateLimit(20, 'minutos'), buscarPalestraPorId)   // /palestras/:id → busca por ID
router.post('/', authMiddleware, rateLimit(3, 'minutos'), criarPalestra)            // /palestras → cria palestra
router.put('/:id', authMiddleware, rateLimit(5, 'minutos'), atualizarPalestra)      // /palestras/:id → atualiza palestra
router.delete('/:id', authMiddleware, rateLimit(2, 'minutos'), excluirPalestra)     // /palestras/:id → exclui palestra

export default router