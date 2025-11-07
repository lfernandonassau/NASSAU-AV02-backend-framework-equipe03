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

const router = express.Router()

// CRUD de Eventos
router.get('/', listarEventos)              // /eventos → lista todos
router.get('/:id', buscarEventoPorId)       // /eventos/:id → busca por ID
router.post('/', criarEvento)               // /eventos → cria evento
router.put('/:id', atualizarEvento)         // /eventos/:id → atualiza evento
router.delete('/:id', excluirEvento)        // /eventos/:id → exclui evento

export default router
