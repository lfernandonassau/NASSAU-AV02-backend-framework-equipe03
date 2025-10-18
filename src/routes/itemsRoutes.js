const express = require('express');
const router = express.Router();

// --- Ponto de Atenção: Controller de Itens (O seu arquivo) ---
// O seu controller já tem as funções best_test_request e postFunction.
// As funções CRUD (createItem, getItemById) devem ser exportadas por ele.
const itemsController = require('../controllers/itemController');

// =================================================================
// ROTAS DE ITENS (/api/items)
// =================================================================

// [GET] /api/items
// Objetivo: Listar todos os itens ou filtrar por query params.
router.get('/', itemsController.listItems);

// [POST] /api/items
// Objetivo: Criar um novo item. Mapeia para a função que usa services.criarItem.
router.post('/', itemsController.createItem);

// [GET] /api/items/:id
// Objetivo: Consultar um item específico. Mapeia para a função que usa services.lerItem.
router.get('/:id', itemsController.getItemById);

// [PUT] /api/items/:id
// Objetivo: Editar (substituir) um item específico.
router.put('/:id', itemsController.updateItem);

// [DELETE] /api/items/:id
// Objetivo: Apagar um item específico.
router.delete('/:id', itemsController.deleteItem);

// [POST] /api/items/:id/move
// Objetivo: Mover o item para um novo container/posição.
router.post('/:id/move', itemsController.moveItem);

// --- Rotas de Teste (Extraídas do seu código original) ---

// [GET] /api/items/test
// Rota de teste simples (Mapeada para sua função best_test_request)
router.get('/test', itemsController.best_test_request);

module.exports = router;