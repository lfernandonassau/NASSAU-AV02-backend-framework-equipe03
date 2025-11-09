// src/routes/pagamentosRoutes.js
// RESPONSÁVEL: Izídio
// Rotas relacionadas aos pagamentos

import express from 'express'
import {
  listarPagamentos,
  buscarPagamentoPorId,
  criarPagamento,
  atualizarPagamento,
  excluirPagamento
} from '../controllers/pagamentoController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

// CRUD de Pagamentos
router.get('/', authMiddleware, listarPagamentos)           // /pagamentos → lista todos
router.get('/:id', authMiddleware, buscarPagamentoPorId)    // /pagamentos/:id → busca por ID
router.post('/', authMiddleware, criarPagamento)            // /pagamentos → cria pagamento
router.put('/:id', authMiddleware, atualizarPagamento)      // /pagamentos/:id → atualiza pagamento
router.delete('/:id', authMiddleware, excluirPagamento)     // /pagamentos/:id → exclui pagamento

export default router
