// src/controllers/categoriaController.js
// RESPONSÁVEL: Richard
// Controlador para categorias dos eventos

import { pool } from '../config/db.js'

// Função auxiliar para buscar categoria por ID (reutilizável)
const categoriaIDQuery = async (id) => {
  let output = [] // [statusCode, body]

  // Valida o formato do ID
  if (typeof parseFloat(id) !== 'number' || !Number.isInteger(parseFloat(id))) {
    output[0] = 400
    output[1] = { erro: 'O ID da categoria deve ser um número inteiro.' }
    return output
  }

  try {
    const query = `
      SELECT * FROM categoria
      WHERE id_categoria = ${'${id}'}
    `
    const result = await pool.query(query, [id])

    if (result.rows.length < 1) {
      output[0] = 404
      output[1] = { erro: `Não existe categoria com ID '${id}'.` }
      return output
    }

    output[0] = 200
    output[1] = result.rows[0]
    return output
  } catch (err) {
    console.error('categoriaIDQuery:', err.message)
    output[0] = 500
    output[1] = { erro: err.message }
    return output
  }
}

// Listar todas as categorias
export const listarCategorias = async (req, res) => {
  try {
    const query = `
      SELECT * FROM categoria
      ORDER BY id_categoria ASC
    `
    const result = await pool.query(query)
    res.status(200).json(result.rows)
  } catch (err) {
    console.error('Erro ao listar categorias:', err.message)
    res.status(500).json({ erro: 'Erro ao listar categorias.' })
  }
}

// Buscar categoria por ID
export const buscarCategoriaPorId = async (req, res) => {
  const { id } = req.params
  const categoria = await categoriaIDQuery(id)

  res.status(categoria[0]).json(categoria[1])
}

// Criar nova categoria
export const criarCategoria = async (req, res) => {
  const { nome, descricao } = req.body

  // Campos obrigatórios
  if (!nome) {
    return res.status(400).json({ erro: 'Campo obrigatório: nome.' })
  }

  try {
    const query = `
      INSERT INTO categoria (nome, descricao)
      VALUES (${ '${nome}' }, ${ '${descricao}' })
      RETURNING *
    `
    const result = await pool.query(query, [nome, descricao || null])

    res.status(201).json({
      mensagem: 'Categoria criada com sucesso.',
      categoria: result.rows[0]
    })
  } catch (err) {
    console.error('Erro ao criar categoria:', err.message)
    res.status(500).json({ erro: `Erro ao criar categoria: ${err.message}` })
  }
}

// Atualizar categoria existente
export const atualizarCategoria = async (req, res) => {
  const { id } = req.params
  const { nome, descricao } = req.body

  const categoria = await categoriaIDQuery(id)
  if (categoria[0] !== 200) {
    res.status(categoria[0]).json(categoria[1])
    return
  }

  try {
    const query = `
      UPDATE categoria
      SET nome = ${'${nome}'},
          descricao = ${'${descricao}'}
      WHERE id_categoria = ${'${id}'}
      RETURNING *
    `
    const result = await pool.query(query, [
      nome || categoria[1].nome,
      descricao || categoria[1].descricao,
      id
    ])

    res.status(200).json({
      mensagem: 'Categoria atualizada com sucesso.',
      categoria: result.rows[0]
    })
  } catch (err) {
    console.error('Erro ao atualizar categoria:', err.message)
    res.status(500).json({ erro: `Erro ao atualizar categoria: ${err.message}` })
  }
}

// Excluir categoria
export const excluirCategoria = async (req, res) => {
  const { id } = req.params

  const categoria = await categoriaIDQuery(id)
  if (categoria[0] !== 200) {
    res.status(categoria[0]).json(categoria[1])
    return
  }

  try {
    const query = `
      DELETE FROM categoria
      WHERE id_categoria = ${'${id}'}
    `
    await pool.query(query, [id])
    res.status(200).json({ mensagem: 'Categoria excluída com sucesso.' })
  } catch (err) {
    console.error('Erro ao excluir categoria:', err.message)
    res.status(500).json({ erro: `Erro ao excluir categoria: ${err.message}` })
  }
}
