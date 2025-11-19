// src/routes/eventosRoutes.js
// RESPONSÁVEL: Izídio
// Rotas relacionadas aos eventos

import express from 'express'
import {
  listarEventos,
  buscarEventoPorId,
  criarEvento,
  atualizarEvento,
  excluirEvento
} from '../controllers/eventoController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// CRUD de Eventos
router.get('/', authMiddleware, listarEventos)              // /eventos → lista todos
router.get('/:id', authMiddleware, buscarEventoPorId)       // /eventos/:id → busca por ID
router.post('/', authMiddleware, criarEvento)               // /eventos → cria evento
router.put('/:id', authMiddleware, atualizarEvento)         // /eventos/:id → atualiza evento
router.delete('/:id', authMiddleware, excluirEvento)        // /eventos/:id → exclui evento

export default router
