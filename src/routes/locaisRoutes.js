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

const router = express.Router()

// CRUD de Locais
router.get('/', listarLocais)           // /locais → lista todos
router.get('/:id', buscarLocalPorId)    // /locais/:id → busca por ID
router.post('/', criarLocal)            // /locais → cria local
router.put('/:id', atualizarLocal)      // /locais/:id → atualiza local
router.delete('/:id', excluirLocal)     // /locais/:id → exclui local

export default router
