// src/controllers/usuarioController.js
// RESPONSÁVEL: Richard
// Controlador para usuários

import {
  Entidade,
  IDQuery,
  listarColunas,
  buscarColunaPorId,
  deletarColuna
} from "./genericController.js"

import { pool } from '../config/db.js'
import bcrypt from 'bcryptjs'

const ent = new Entidade('usuario', 'Usuário', false, ['nome', 'email', 'senha', 'tipo', 'data_nascimento'])

// Buscar usuário por ID
const userIDQuery = async (id) => {
  return IDQuery(id, ent)
}

// Listar usuários
export const listarUsuarios = async (req, res) => {
  listarColunas(req, res, ent)
}

// Criar usuário (registro com senha criptografada)
export const criarUsuario = async (req, res) => {
  const { nome, email, senha, tipo = 'participante', data_nascimento } = req.body;

  if (!nome || !email || !senha || !tipo || !data_nascimento) {
    return res.status(400).json({ erro: 'Nome, email, senha, tipo e data_nascimento são obrigatórios.' });
  }

  try {
    // Verifica se já existe usuário com esse email
    const usuarioExistente = await pool.query(`SELECT * FROM usuario WHERE email = $1`, [email]);
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ error: 'Este email já está cadastrado.' });
    }

    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // INSERE INCLUINDO A DATA DE NASCIMENTO
    const result = await pool.query(
      `
      INSERT INTO usuario (nome, email, senha, tipo, data_nascimento)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
      `,
      [nome, email, senhaCriptografada, tipo, data_nascimento]
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso.',
      usuario: result.rows[0]
    });
  } catch (err) {
    console.error('Erro ao criar usuário:', err.message);
    res.status(500).json({ error: `Erro ao criar usuário: ${err.message}` });
  }
}


// Buscar usuário por ID, chamado pela rota mas usa a função reutilizável abaixo
export const buscarUsuarioPorId = async (req, res) => {
  buscarColunaPorId(req, res, ent)
}

export const atualizarUsuario = async (req, res) => {
  const { id } = req.params
  const { nome, email, senha, tipo, data_nascimento } = req.body

  const user = await userIDQuery(id)
  if (user[0] !== 200) {
    res.status(user[0]).json(user[1])
    return
  }

  try {
    // Monta dinamicamente apenas os campos enviados no body
    const updates = []
    if (nome) updates.push(`nome = '${nome}'`)
    if (email) updates.push(`email = '${email}'`)
    if (senha) {
      const senhaCriptografada = await bcrypt.hash(senha, 10)
      updates.push(`senha = '${senhaCriptografada}'`)
    }
    if (tipo) updates.push(`tipo = '${tipo}'`)
    if (data_nascimento) updates.push(`data_nascimento = '${data_nascimento}'`)

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo fornecido para atualização.' })
    }

    const query = `
      UPDATE usuario
      SET ${updates.join(', ')}
      WHERE id_usuario = ${id}
      RETURNING *;
    `

    const result = await pool.query(query)
    res.status(200).json({
      message: 'Usuário atualizado com sucesso.',
      usuario: result.rows[0]
    })
  } catch (err) {
    console.error('Erro ao atualizar usuario:', err.message)
    res.status(500).json({ error: `Erro ao atualizar usuario: ${err.message}` })
  }
}

// Deletar usuario
export const deletarUsuario = async (req, res) => {
  deletarColuna(req, res, ent)
}
