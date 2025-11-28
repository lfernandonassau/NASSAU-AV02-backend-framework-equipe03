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
import { adminMiddleware } from '../middleware/adminMiddleware.js'
import { rateLimit } from '../middleware/rateLimitMiddleware.js'

const router = express.Router()

// CRUD de Pagamentos
router.get('/', authMiddleware, adminMiddleware, rateLimit(10, 'minutos'), listarPagamentos)           
router.get('/:id', authMiddleware, adminMiddleware, rateLimit(20, 'minutos'), buscarPagamentoPorId)    
router.post('/', authMiddleware, rateLimit(3, 'minutos'), criarPagamento)            
router.put('/:id', authMiddleware, rateLimit(5, 'minutos'), atualizarPagamento)      
router.delete('/:id', authMiddleware, adminMiddleware, rateLimit(2, 'minutos'), excluirPagamento)

export default router