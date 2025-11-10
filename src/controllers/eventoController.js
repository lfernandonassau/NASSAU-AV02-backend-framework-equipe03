// src/controllers/eventoController.js
// RESPONSÁVEL: Richard
// Controlador para eventos

import { pool } from '../config/db.js'

// 🧩 Função auxiliar para buscar evento por ID (reutilizável)
const eventoIDQuery = async (id) => {
  let output = [] // [statusCode, body]

  if (isNaN(parseInt(id))) {
    output[0] = 400
    output[1] = { erro: 'O ID do evento deve ser um número inteiro.' }
    return output
  }

  try {
    const query = `
      SELECT * FROM evento
      WHERE id_evento = ${id};
    `
    const result = await pool.query(query)

    if (result.rows.length < 1) {
      output[0] = 404
      output[1] = { erro: `Não existe evento com ID '${id}'.` }
      return output
    }

    output[0] = 200
    output[1] = result.rows[0]
    return output
  } catch (err) {
    console.error('eventoIDQuery:', err.message)
    output[0] = 500
    output[1] = { erro: err.message }
    return output
  }
}

// 📋 Listar todos os eventos
export const listarEventos = async (req, res) => {
  try {
    const query = `
      SELECT e.*, l.nome AS nome_local, c.nome AS nome_categoria
      FROM evento e
      JOIN local l ON e.id_local = l.id_local
      JOIN categoria c ON e.id_categoria = c.id_categoria
      ORDER BY e.id_evento ASC;
    `
    const result = await pool.query(query)
    res.status(200).json(result.rows)
  } catch (err) {
    console.error('Erro ao listar eventos:', err.message)
    res.status(500).json({ erro: 'Erro ao listar eventos.' })
  }
}

// 🔍 Buscar evento por ID
export const buscarEventoPorId = async (req, res) => {
  const { id } = req.params
  const evento = await eventoIDQuery(id)
  res.status(evento[0]).json(evento[1])
}

// ➕ Criar novo evento
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

// ✏️ Atualizar evento existente
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

// 🗑️ Excluir evento
export const excluirEvento = async (req, res) => {
  const { id } = req.params

  const evento = await eventoIDQuery(id)
  if (evento[0] !== 200) {
    res.status(evento[0]).json(evento[1])
    return
  }

  try {
    const query = `
      DELETE FROM evento
      WHERE id_evento = ${id};
    `
    await pool.query(query)
    res.status(200).json({ mensagem: 'Evento excluído com sucesso.' })
  } catch (err) {
    console.error('Erro ao excluir evento:', err.message)
    res.status(500).json({ erro: `Erro ao excluir evento: ${err.message}` })
  }
}
