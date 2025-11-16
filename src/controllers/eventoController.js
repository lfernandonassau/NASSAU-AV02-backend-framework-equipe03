// src/controllers/eventoController.js
// RESPONSÁVEL: Richard
// Controlador para eventos

import {
  Entidade,
  IDQuery,
  listarColunas,
  buscarColunaPorId,
  criarColuna,
  atualizarColuna,
  deletarColuna
} from "./genericController.js"
import { pool } from '../config/db.js'

const ent = new Entidade('evento', 'Evento', false, ['titulo', 'data_inicio', 'data_fim', 'id_local', 'id_categoria'], ['descricao'])

// Função auxiliar para buscar evento por ID (reutilizável)
const eventoIDQuery = async (id) => {
  return IDQuery(id, ent)
}

// Listar todos os eventos
export const listarEventos = async (req, res) => {
  listarColunas(req, res, ent)
}

// Buscar evento por ID
export const buscarEventoPorId = async (req, res) => {
  buscarColunaPorId(req, res, ent)
}

// Criar novo evento
export const criarEvento = async (req, res) => {
  const { titulo, descricao, data_inicio, data_fim, id_local, id_categoria } = req.body

  if (!titulo || !data_inicio || !data_fim || !id_local || !id_categoria) {
    return res.status(400).json({
      erro: 'Campos obrigatórios: titulo, data_inicio, data_fim, id_local e id_categoria.'
    })
  }

  try {
    const query = `
      INSERT INTO evento (titulo, descricao, data_inicio, data_fim, id_local, id_categoria)
      VALUES (
        '${titulo}',
        ${descricao ? `'${descricao}'` : 'NULL'},
        '${data_inicio}',
        '${data_fim}',
        ${id_local},
        ${id_categoria}
      )
      RETURNING *;
    `
    const result = await pool.query(query)

    res.status(201).json({
      mensagem: 'Evento criado com sucesso.',
      evento: result.rows[0]
    })
  } catch (err) {
    console.error('Erro ao criar evento:', err.message)
    res.status(500).json({ erro: `Erro ao criar evento: ${err.message}` })
  }
}

// Atualizar evento existente
export const atualizarEvento = async (req, res) => {
  const { id } = req.params
  const { titulo, descricao, data_inicio, data_fim, id_local, id_categoria } = req.body

  if (id_local !== undefined || id_categoria !== undefined) {
    return res.status(400).json({
      erro: 'Os campos id_local e id_categoria não podem ser alterados após a criação do evento.'
    })
  }

  const evento = await eventoIDQuery(id)
  if (evento[0] !== 200) {
    res.status(evento[0]).json(evento[1])
    return
  }

  const updates = []
  if (titulo !== undefined) updates.push(`titulo = '${titulo}'`)
  if (descricao !== undefined) updates.push(`descricao = '${descricao}'`)
  if (data_inicio !== undefined) updates.push(`data_inicio = '${data_inicio}'`)
  if (data_fim !== undefined) updates.push(`data_fim = '${data_fim}'`)

  if (updates.length === 0) {
    return res.status(400).json({ erro: 'Nenhum campo válido foi enviado para atualização.' })
  }

  const query = `
    UPDATE evento
    SET ${updates.join(', ')}
    WHERE id_evento = ${id}
    RETURNING *;
  `

  try {
    const result = await pool.query(query)
    res.status(200).json({
      mensagem: 'Evento atualizado com sucesso.',
      evento: result.rows[0]
    })
  } catch (err) {
    console.error('Erro ao atualizar evento:', err.message)
    res.status(500).json({ erro: `Erro ao atualizar evento: ${err.message}` })
  }
}

// Excluir evento
export const excluirEvento = async (req, res) => {
  deletarColuna(req, res, ent)
}
