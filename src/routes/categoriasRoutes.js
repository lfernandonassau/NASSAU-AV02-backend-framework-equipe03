// src/routes/categoriasRoutes.js
// RESPONSÁVEL: Izídio
// Rotas relacionadas às categorias

import express from 'express'
import {
  listarCategorias,
  buscarCategoriaPorId,
  criarCategoria,
  atualizarCategoria,
  excluirCategoria
} from '../controllers/categoriaController.js'

const router = express.Router()

// CRUD de Categorias
router.get('/', listarCategorias)           // /categorias → lista todas
router.get('/:id', buscarCategoriaPorId)    // /categorias/:id → busca por ID
router.post('/', criarCategoria)            // /categorias → cria categoria
router.put('/:id', atualizarCategoria)      // /categorias/:id → atualiza categoria
router.delete('/:id', excluirCategoria)     // /categorias/:id → exclui categoria

export default router
