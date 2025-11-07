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

const router = express.Router()

// CRUD de Pagamentos
router.get('/', listarPagamentos)           // /pagamentos → lista todos
router.get('/:id', buscarPagamentoPorId)    // /pagamentos/:id → busca por ID
router.post('/', criarPagamento)            // /pagamentos → cria pagamento
router.put('/:id', atualizarPagamento)      // /pagamentos/:id → atualiza pagamento
router.delete('/:id', excluirPagamento)     // /pagamentos/:id → exclui pagamento

export default router
