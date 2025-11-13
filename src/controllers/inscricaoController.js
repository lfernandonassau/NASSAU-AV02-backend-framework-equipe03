// src/controllers/inscricaoController.js
// RESPONSÁVEL: Richard
// Controlador para inscrições

import { pool } from '../config/db.js'


const inscricaoIDQuery = async (id) => {
  let output = [] // [código de status HTTP, corpo da resposta (JSON)]

  // Verifica se id é um número inteiro
  if (typeof parseFloat(id) !== "number" || Number.isInteger(parseFloat(id)) !== true) {
    output[0] = 400; output[1] = { Erro: 'O ID da inscrição deve ser um número inteiro.' }
    return output
  }

  try {
    const result = await pool.query(`SELECT * FROM inscricao WHERE id_inscricao = ${id}`)

    if (result.rows[0].visibilidade === "inativo" || result.rows[0].status_interno !== "normal") {
      let status = result.rows[0].visibilidade === "inativo" ? "inativo" : result.rows[0].status_interno
      status = status.slice(0, status.length -1).padEnd(status.length, "a") // Tornando status em um substantivo feminino
      output[0] = 403; output[1] = { Erro: `Esta inscrição está ${status}` }
      return output
    }

    if (result.rows.length < 1 || result.rows[0].visibilidade === "excluido") {
      output[0] = 404
      output[1] = { Erro: `Não há inscrição com ID '${id}.'` }
      return output
    }

    output[0] = 200; output[1] = result.rows[0]
    return output
  } catch (err) {
    console.error('inscricaoIDQuery:', err.message)
    output[0] = 500; output[1] = { error: err.message }
    return output
  }
}

// Listar inscrição
export const listarInscricoes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inscricao ORDER BY id_inscricao ASC')
    res.json(result.rows)
  } catch (err) {
    console.error('Erro ao listar inscrições:', err.message)
    res.status(500).json({ error: `Erro ao listar inscrições: ${err.message}` })
  }
}


// Criar inscrição
export const criarInscricao = async (req, res) => {
  const { id_usuario, id_evento, status } = req.body

  if (!id_usuario || !id_evento || !status) { // é necessário incluir o status? perguntar depois
    return res.status(400).json({ erro: `Todos os campos a seguir devem ser preenchidos:
      id_usuario
      id_evento
      status
      `})
  }

  try {
    const result = await pool.query(`
      INSERT INTO inscricao (id_usuario, id_evento, status)
      VALUES ('${id_usuario}', '${id_evento}', '${status}')
      RETURNING *;
    `)

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('Erro ao criar inscrição:', err.message)
    res.status(500).json({ error: `Erro ao criar inscrição: ${err.message}` })
  }
}


// Buscar inscrição por ID
export const buscarInscricaoPorId = async (req, res) => {
  const { id } = req.params

  const id_search = await inscricaoIDQuery(id)
  res.status(id_search[0]).json(id_search[1])
}



// Atualizar inscrição
export const atualizarInscricao = async (req, res) => {
  const { id } = req.params
  const { id_usuario, id_evento, status } = req.body

  const user = await inscricaoIDQuery(id)
  if (user[0] !== 200) {
    res.status(user[0]).json(user[1])
    return
  }

  let query = []

  if (!id_usuario && !id_evento && !status){
    res.status(400).json({ erro: "Nenhum campo para alterar."})
    return
  }
  if (id_usuario){
    query.push(`id_usuario = '${id_usuario}'`)
  }
  if (id_evento){
    query.push(`id_evento = '${id_evento}'`)
  }
  if (status){
    query.push(`status = '${status}'`)
  }

  query = query.toString()
  query.replaceAll("\"", "")
  query.slice(1, query.length - 1)

  try {
    const result = await pool.query(`
      UPDATE inscricao
      SET ${query}
      WHERE id_inscricao = ${id};
      SELECT * FROM inscricao WHERE id_inscricao = ${id};
    `)

    res.status(200).json(result[1].rows[0])
  } catch (err) {
    console.error('Erro ao atualizar usuario:', err.message)
    res.status(500).json({ error: `Erro ao atualizar usuario: ${err.message}` })
  }
}

// Deletar inscrição
export const excluirInscricao = async (req, res) => {
  const { id } = req.params

  const user = await inscricaoIDQuery(id)
  if (user[0] !== 200) {
    res.status(user[0]).json(user[1])
    return
  }

  try {
    await pool.query(`UPDATE inscricao SET visibilidade = 'excluido' WHERE id_inscricao = ${id};`)
    res.status(200).json('Inscrição apagada com sucesso.')
  } catch (err) {
    console.error('Erro ao apagar inscrição:', err.message)
    res.status(500).json({ error: `Erro ao apagar inscrição: ${err.message}` })
  }
}