// src/routes/loginRoutes.js
// RESPONSÁVEL: CT
// Rotas relacionadas à autenticação (login, logout e registro)

import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../config/db.js'
import { tokenBlacklist } from '../middleware/authMiddleware.js'

const router = express.Router()

// Login de usuário (gera token JWT)
router.post('/login', async (req, res) => {
  const { email, senha } = req.body
  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' })
  }

  try {
    const result = await pool.query(`SELECT * FROM usuario WHERE email = '${email}'`)
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' })
    }

    const usuario = result.rows[0]
    const senhaValida = await bcrypt.compare(senha, usuario.senha)
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha incorreta.' })
    }

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, email: usuario.email, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    )

    res.status(200).json({
      message: 'Login realizado com sucesso.',
      usuario: {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      },
      token
    })
  } catch (err) {
    console.error('Erro ao realizar login:', err.message)
    res.status(500).json({ erro: `Erro ao realizar login: ${err.message}` })
  }
})

// Logout de usuário (invalidação de token em memória)
router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(400).json({ erro: 'Token não fornecido no logout.' })
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader

  // Adiciona o token na blacklist
  tokenBlacklist.add(token)

  res.status(200).json({ message: 'Logout realizado com sucesso. Token invalidado.' })
})

// Registro de novo usuário
router.post('/register', async (req, res) => {
  const { nome, email, senha, tipo = 'participante', data_nascimento } = req.body
  if (!nome || !email || !senha || !data_nascimento) {
    return res.status(400).json({ erro: 'Nome, email, senha e data de nascimento são obrigatórios.' })
  }

  try {
    const usuarioExistente = await pool.query(`SELECT * FROM usuario WHERE email = '${email}'`)
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ erro: 'Este email já está cadastrado.' })
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10)
    const result = await pool.query(`
      INSERT INTO usuario (nome, email, senha, tipo, data_nascimento)
      VALUES ('${nome}', '${email}', '${senhaCriptografada}', '${tipo}', '${data_nascimento}')
      RETURNING id_usuario, nome, email, tipo, data_nascimento;
    `)

    res.status(201).json({
      message: 'Usuário registrado com sucesso.',
      usuario: result.rows[0]
    })
  } catch (err) {
    console.error('Erro ao registrar usuário:', err.message)
    res.status(500).json({ erro: `Erro ao registrar usuário: ${err.message}` })
  }
})

export default router
