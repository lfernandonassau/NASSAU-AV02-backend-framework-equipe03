// src/controllers/inscricaoController.js
// RESPONSÁVEL: Richard
// Controlador para inscrições

import {
  Entidade,
  listarColunas,
  buscarColunaPorId,
  criarColuna,
  atualizarColuna,
  deletarColuna
} from "./genericController.js"

const ent = new Entidade('inscricao', 'Inscrição', true, ['id_usuario', 'id_evento', 'status'], [], 'Inscrições')

// Listar inscrição
export const listarInscricoes = async (req, res) => {
  listarColunas(req, res, ent)
}


// Criar inscrição
export const criarInscricao = async (req, res) => {
  criarColuna(req, res, ent)
}


// Buscar inscrição por ID
export const buscarInscricaoPorId = async (req, res) => {
  buscarColunaPorId(req, res, ent)
}


// Atualizar inscrição
export const atualizarInscricao = async (req, res) => {
  atualizarColuna(req, res, ent)
}

// Deletar inscrição
export const excluirInscricao = async (req, res) => {
  deletarColuna(req, res, ent)
}