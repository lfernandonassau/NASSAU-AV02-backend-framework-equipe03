// src/controllers/eventoController.js
// RESPONSÁVEL: Richard
// Controlador para eventos

import { pool } from '../config/db.js'

// Função auxiliar para buscar evento por ID (reutilizável)
const eventoIDQuery = async (id) => {
  let output = [] // [statusCode, body]

  // Verifica se o ID é um número inteiro válido
  if (typeof parseFloat(id) !== 'number' || !Number.isInteger(parseFloat(id))) {
    output[0] = 400
    output[1] = { erro: 'O ID do evento deve ser um número inteiro.' }
    return output
  }

  try {
    const query = `SELECT * FROM evento WHERE id_evento = ${'$id'}`
    const result = await pool.query(query.replace('$id', '$1'), [id])

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
    const result = await pool.query(`
      SELECT e.*, l.nome AS nome_local, c.nome AS nome_categoria
      FROM evento e
      JOIN local l ON e.id_local = l.id_local
      JOIN categoria c ON e.id_categoria = c.id_categoria
      ORDER BY e.id_evento ASC
    `)
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

  // Verificação de campos obrigatórios
  if (!titulo || !data_inicio || !data_fim || !id_local || !id_categoria) {
    return res.status(400).json({
      erro: 'Campos obrigatórios: titulo, data_inicio, data_fim, id_local e id_categoria.'
    })
  }

  try {
    const query = `
      INSERT INTO evento (titulo, descricao, data_inicio, data_fim, id_local, id_categoria)
      VALUES (${'$titulo'}, ${'$descricao'}, ${'$data_inicio'}, ${'$data_fim'}, ${'$id_local'}, ${'$id_categoria'})
      RETURNING *
    `.replace(/\$(\w+)/g, (_, v) => {
      const vars = { titulo: '$1', descricao: '$2', data_inicio: '$3', data_fim: '$4', id_local: '$5', id_categoria: '$6' }
      return vars[v]
    })

    const result = await pool.query(query, [titulo, descricao || null, data_inicio, data_fim, id_local, id_categoria])

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

  const evento = await eventoIDQuery(id)
  if (evento[0] !== 200) {
    res.status(evento[0]).json(evento[1])
    return
  }

  try {
    const query = `
      UPDATE evento
      SET titulo = ${'$titulo'},
          descricao = ${'$descricao'},
          data_inicio = ${'$data_inicio'},
          data_fim = ${'$data_fim'},
          id_local = ${'$id_local'},
          id_categoria = ${'$id_categoria'}
      WHERE id_evento = ${'$id'}
      RETURNING *
    `.replace(/\$(\w+)/g, (_, v) => {
      const vars = {
        titulo: '$1', descricao: '$2', data_inicio: '$3',
        data_fim: '$4', id_local: '$5', id_categoria: '$6', id: '$7'
      }
      return vars[v]
    })

    const result = await pool.query(query, [titulo, descricao || null, data_inicio, data_fim, id_local, id_categoria, id])

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
    const query = `DELETE FROM evento WHERE id_evento = ${'$id'}`.replace('$id', '$1')
    await pool.query(query, [id])
    res.status(200).json({ mensagem: 'Evento excluído com sucesso.' })
  } catch (err) {
    console.error('Erro ao excluir evento:', err.message)
    res.status(500).json({ erro: `Erro ao excluir evento: ${err.message}` })
  }
}
