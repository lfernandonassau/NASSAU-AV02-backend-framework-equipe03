// src/routes/inscricoesRoutes.js
// RESPONSÁVEL: Izídio
// Rotas relacionadas às inscrições

import express from 'express'
import {
  listarInscricoes,
  buscarInscricaoPorId,
  criarInscricao,
  atualizarInscricao,
  excluirInscricao
} from '../controllers/inscricaoController.js'

const router = express.Router()

// CRUD de Inscrições
router.get('/', listarInscricoes)            // /inscricoes → lista todas
router.get('/:id', buscarInscricaoPorId)     // /inscricoes/:id → busca por ID
router.post('/', criarInscricao)             // /inscricoes → cria inscrição
router.put('/:id', atualizarInscricao)       // /inscricoes/:id → atualiza inscrição
router.delete('/:id', excluirInscricao)      // /inscricoes/:id → exclui inscrição

export default router
