import { pool } from '../config/db.js'
import bcrypt from 'bcryptjs'

// listar usuarios
export const listarUsuarios = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuario ORDER BY id ASC')
    res.json(result.rows)
  } catch (err) {
    console.error('erro ao listar usuarios:', err.message)
    res.status(500).json({ error: 'erro ao buscar usuarios' })
  }
}

// criar usuario (registro com senha criptografada)
export const criarUsuario = async (req, res) => {
  const { nome, email, senha, tipo = 'participante' } = req.body

  if (!nome || !email || !senha || !tipo) {
    return res.status(400).json({ error: 'nome, email e senha e tipo são obrigatórios' })
  }

  try {
    // Verifica se já existe usuário com esse email
    const usuarioExistente = await pool.query('SELECT * FROM usuario WHERE email = $1', [email])
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ error: 'email já cadastrado' })
    }

    // Criptografa a senha antes de salvar
    const senhaCriptografada = await bcrypt.hash(senha, 10)

    const result = await pool.query(
      'INSERT INTO usuario (nome, email, senha, tipo) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, email, senhaCriptografada, tipo]
    )

    res.status(201).json({
      message: 'usuário criado com sucesso',
      usuario: { id: result.rows[0].id, nome, email }
    })
  } catch (err) {
    console.error('erro ao criar usuario:', err.message)
    res.status(500).json({ error: 'erro ao criar usuario' })
  }
}

// TODO: APENAS EXEMPLO, NECESSARIO PREENCHER E IMPLEMENTAR
// Buscar usuario por ID
export const buscarUsuarioPorId = async (req, res) => {

}

// TODO: APENAS EXEMPLO, NECESSARIO PREENCHER E IMPLEMENTAR
// Atualizar usuario
export const atualizarUsuario = async (req, res) => {

}

// TODO: APENAS EXEMPLO, NECESSARIO PREENCHER E IMPLEMENTAR
// Deletar usuario
export const deletarUsuario = async (req, res) => {

}
