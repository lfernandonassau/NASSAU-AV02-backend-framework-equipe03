// src/routes/eventosRoutes.js
// RESPONSÁVEL: Izídio + ajustes finais

import express from 'express'

import {
  listarEventos,
  buscarEventoPorId,
  criarEvento,
  atualizarEvento,
  excluirEvento,
  verMeuPapelNoEvento
} from '../controllers/eventoController.js'

import { authMiddleware } from '../middleware/authMiddleware.js'
import { adminMiddleware } from '../middleware/adminMiddleware.js'
import { rateLimit } from '../middleware/rateLimitMiddleware.js'

const router = express.Router()

// CRUD
router.get('/', authMiddleware, rateLimit(10, 'minutos'), listarEventos)
router.get('/:id', authMiddleware, rateLimit(20, 'minutos'), buscarEventoPorId)
router.post('/', authMiddleware, rateLimit(3, 'minutos'), criarEvento)
router.put('/:id', authMiddleware, rateLimit(5, 'minutos'), atualizarEvento)
router.delete('/:id', authMiddleware, rateLimit(2, 'minutos'), excluirEvento)

// 🔥 VER PAPEL DO USUÁRIO LOGADO NO EVENTO
router.get('/:id_evento/papel/me', authMiddleware, rateLimit(15, 'minutos'), verMeuPapelNoEvento)

export default router