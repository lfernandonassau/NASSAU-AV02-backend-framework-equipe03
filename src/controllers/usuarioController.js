// src/controllers/usuarioController.js
// RESPONSÁVEL: Richard
// Controlador para usuários

import { pool } from '../config/db.js'
import bcrypt from 'bcryptjs'


// Buscar usuário por ID, reutilizável em outras funções para reduzir a repetição (nome da função podia ser melhor, mas tô sem ideias)
const userIDQuery = async (id) => {
  let output = [] // [código de status HTTP, corpo da resposta (JSON)]

  // Verifica se id é um número inteiro
  if (typeof parseFloat(id) !== "number" || Number.isInteger(parseFloat(id)) !== true) {
    output[0] = 400
    output[1] = { Erro: 'O ID do usuário deve ser um número inteiro.' }
    return output
  }

  try {
    const result = await pool.query(`SELECT * FROM usuario WHERE id_usuario = ${id}`)

    if (result.rows.length < 1) {
      output[0] = 404
      output[1] = { Erro: `Não existe usuário com ID '${id}.'` }
      return output
    }

    output[0] = 200
    output[1] = result.rows[0]
    return output
  } catch (err) {
    console.error('findUserByID:', err.message)
    output[0] = 500
    output[1] = { error: err.message }
    return output
  }
}

// Listar usuários
export const listarUsuarios = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuario ORDER BY id_usuario ASC')
    res.json(result.rows)
  } catch (err) {
    console.error('erro ao listar usuarios:', err.message)
    res.status(500).json({ error: 'Erro ao listar usuarios' })
  }
}

// Criar usuário (registro com senha criptografada)
export const criarUsuario = async (req, res) => {
  const { nome, email, senha, tipo = 'participante' } = req.body

  if (!nome || !email || !senha || !tipo) {
    return res.status(400).json({ erro: 'Nome, email, senha e tipo são campos obrigatórios' })
  }

  try {
    // Verifica se já existe usuário com esse email
    const usuarioExistente = await pool.query(`SELECT * FROM usuario WHERE email = '${email}'`)
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ error: 'Este email já está cadastrado.' })
    }

    // Criptografa a senha antes de salvar
    const senhaCriptografada = await bcrypt.hash(senha, 10)

    const result = await pool.query(`
      INSERT INTO usuario (nome, email, senha, tipo)
      VALUES ('${nome}', '${email}', '${senhaCriptografada}', '${tipo}')
      RETURNING *;
    `)

    res.status(201).json({
      message: 'Usuário criado com sucesso.',
      usuario: { id: result.rows[0].id, nome, email }
    })
  } catch (err) {
    console.error('Erro ao criar usuario:', err.message)
    res.status(500).json({ error: `Erro ao criar usuario: ${err.message}` })
  }
}

// Buscar usuário por ID, chamado pela rota mas usa a função reutilizável abaixo
export const buscarUsuarioPorId = async (req, res) => {
  const { id } = req.params

  const user_search = await userIDQuery(id)
  res.status(user_search[0]).json(user_search[1])
}

// Atualizar usuario
export const atualizarUsuario = async (req, res) => {
  const { id } = req.params
  const { nome, email, senha, tipo } = req.body

  const user = await userIDQuery(id)
  if (user[0] !== 200) {
    res.status(user[0]).json(user[1])
    return
  }

  try {
    const result = await pool.query(`
      UPDATE usuario
      SET nome = '${nome}', email = '${email}', senha = '${senha}', tipo = '${tipo}'
      WHERE id_usuario = ${id};
      SELECT * FROM usuario WHERE id_usuario = ${id};
    `)

    res.status(200).json(result[1].rows[0])
  } catch (err) {
    console.error('Erro ao atualizar usuario:', err.message)
    res.status(500).json({ error: `Erro ao atualizar usuario: ${err.message}` })
  }
}

// Deletar usuario
export const deletarUsuario = async (req, res) => {
  const { id } = req.params

  const user = await userIDQuery(id)
  if (user[0] !== 200) {
    res.status(user[0]).json(user[1])
    return
  }

  try {
    await pool.query(`DELETE FROM usuario WHERE id_usuario = ${id};`)
    res.status(200).json('Usuário apagado com sucesso.')
  } catch (err) {
    console.error('Erro ao apagar usuario:', err.message)
    res.status(500).json({ error: `Erro ao apagar usuario: ${err.message}` })
  }
}
