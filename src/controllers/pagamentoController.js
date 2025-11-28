// src/controllers/pagamentoController.js
// RESPONSÁVEL: Richard
// Controlador para pagamentos

import {
  Entidade,
  listarColunas,
  buscarColunaPorId,
  criarColuna,
  atualizarColuna,
  deletarColuna
} from "./genericController.js"

const ent = new Entidade('pagamento', 'Pagamento', false, ['id_inscricao', 'valor', 'status'])

// Listar pagamentos
export const listarPagamentos = async (req, res) => {
  listarColunas(req, res, ent)
}


// Criar pagamentos
export const criarPagamento = async (req, res) => {
  criarColuna(req, res, ent)
}


// Buscar pagamentos por ID
export const buscarPagamentoPorId = async (req, res) => {
  buscarColunaPorId(req, res, ent)
}


// Atualizar pagamentos
export const atualizarPagamento = async (req, res) => {
  atualizarColuna(req, res, ent)
}

// Deletar pagamentos
export const excluirPagamento = async (req, res) => {
  deletarColuna(req, res, ent)
}