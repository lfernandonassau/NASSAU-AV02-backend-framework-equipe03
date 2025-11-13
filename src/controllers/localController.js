// src/controllers/localController.js
// RESPONSÁVEL: Richard
// Controlador para locais dos eventos

import { pool } from '../config/db.js'

// Função auxiliar para buscar local por ID (reutilizável)
const localIDQuery = async (id) => {
  let output = [] // [statusCode, body]

  // Verifica se id é um número inteiro
  if (typeof parseFloat(id) !== 'number' || !Number.isInteger(parseFloat(id))) {
    output[0] = 400; output[1] = { erro: 'O ID do local deve ser um número inteiro.' }
    return output
  }

  try {
    const result = await pool.query(`SELECT * FROM local WHERE id_local = ${'$id_local'}`)

    if (result.rows[0].visibilidade === "inativo" || result.rows[0].status_interno !== "normal") {
      let status = result.rows[0].visibilidade === "inativo" ? "inativo" : result.rows[0].status_interno

      output[0] = 403; output[1] = { Erro: `Este local está ${status}` }
      return output
    }

    if (result.rows.length < 1 || result.rows[0].visibilidade === "excluido") {
      output[0] = 404
      output[1] = { erro: `Não existe local com ID '${id}'.` }
      return output
    }

    output[0] = 200
    output[1] = result.rows[0]
    return output
  } catch (err) {
    console.error('localIDQuery:', err.message)
    output[0] = 500
    output[1] = { erro: err.message }
    return output
  }
}

// Listar todos os locais
export const listarLocais = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM local ORDER BY id_local ASC')
    res.status(200).json(result.rows)
  } catch (err) {
    console.error('Erro ao listar locais:', err.message)
    res.status(500).json({ erro: 'Erro ao listar locais.' })
  }
}

// Buscar local por ID
export const buscarLocalPorId = async (req, res) => {
  const { id } = req.params
  const local = await localIDQuery(id)

  res.status(local[0]).json(local[1])
}

// ➕ Criar novo local
export const criarLocal = async (req, res) => {
  const { nome, endereco, capacidade } = req.body

  // Campos obrigatórios
  if (!nome) {
    return res.status(400).json({ erro: 'Campo obrigatório: nome.' })
  }

  try {
    const query = `
      INSERT INTO local (nome, endereco, capacidade)
      VALUES (${'$nome'}, ${'$endereco'}, ${'$capacidade'})
      RETURNING *
    `.replace(/\$(\w+)/g, (_, v) => {
      const vars = { nome: '$1', endereco: '$2', capacidade: '$3' }
      return vars[v]
    })

    const result = await pool.query(query, [nome, endereco || null, capacidade || null])

    res.status(201).json({
      mensagem: 'Local criado com sucesso.',
      local: result.rows[0]
    })
  } catch (err) {
    console.error('Erro ao criar local:', err.message)
    res.status(500).json({ erro: `Erro ao criar local: ${err.message}` })
  }
}

// Atualizar local existente
export const atualizarLocal = async (req, res) => {
  const { id } = req.params
  const { nome, endereco, capacidade } = req.body

  const local = await localIDQuery(id)
  if (local[0] !== 200) {
    res.status(local[0]).json(local[1])
    return
  }

  try {
    const query = `
      UPDATE local
      SET nome = ${'$nome'},
          endereco = ${'$endereco'},
          capacidade = ${'$capacidade'}
      WHERE id_local = ${'$id_local'}
      RETURNING *
    `.replace(/\$(\w+)/g, (_, v) => {
      const vars = {
        nome: '$1',
        endereco: '$2',
        capacidade: '$3',
        id_local: '$4'
      }
      return vars[v]
    })

    const result = await pool.query(query, [
      nome || local[1].nome,
      endereco || local[1].endereco,
      capacidade || local[1].capacidade,
      id
    ])

    res.status(200).json({
      mensagem: 'Local atualizado com sucesso.',
      local: result.rows[0]
    })
  } catch (err) {
    console.error('Erro ao atualizar local:', err.message)
    res.status(500).json({ erro: `Erro ao atualizar local: ${err.message}` })
  }
}

// Excluir local
export const excluirLocal = async (req, res) => {
  const { id } = req.params

  const local = await localIDQuery(id)
  if (local[0] !== 200) {
    res.status(local[0]).json(local[1])
    return
  }

  try {
    await pool.query(`UPDATE local SET visibilidade = 'excluido' WHERE id_local = ${id}`)
    res.status(200).json({ mensagem: 'Local excluído com sucesso.' })
  } catch (err) {
    console.error('Erro ao excluir local:', err.message)
    res.status(500).json({ erro: `Erro ao excluir local: ${err.message}` })
  }
}
