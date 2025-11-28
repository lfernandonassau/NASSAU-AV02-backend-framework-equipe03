// src/controllers/inscricaoController.js
// RESPONSÁVEL: Richard + Correções finais de segurança
import {
  Entidade,
  listarColunas,
  buscarColunaPorId,
  criarColuna
} from "./genericController.js"

import { pool } from "../config/db.js"

const ent = new Entidade(
  'inscricao',
  'Inscrição',
  true,
  ['id_usuario', 'id_evento', 'status'], // campos obrigatórios
  [],
  'Inscrições'
)

// FUNÇÃO AUXILIAR: valida se o usuário é dono da inscrição ou admin
async function verificarPermissao(req, res, idInscricao = null) {
  const id = idInscricao || req.params.id

  const consulta = await pool.query(
    "SELECT id_usuario FROM inscricao WHERE id_inscricao = $1 AND visibilidade != 'excluido'",
    [id]
  )

  if (consulta.rowCount === 0) {
    res.status(404).json({ erro: "Inscrição não encontrada." })
    return false
  }

  const dono = consulta.rows[0].id_usuario

  if (req.userTipo === "organizador") return true
  if (req.userId === dono) return true

  res.status(403).json({ erro: "Você não tem permissão para acessar esta inscrição." })
  return false
}

// LISTAR (apenas admin)
export const listarInscricoes = async (req, res) => {
  listarColunas(req, res, ent)
}

// LISTAR MINHAS → só retorna as inscrições do usuário logado
export const listarMinhasInscricoes = async (req, res) => {
  try {
    const usuario = req.userId

    const query = `
      SELECT *
      FROM inscricao
      WHERE id_usuario = $1 AND visibilidade != 'excluido'
      ORDER BY id_inscricao DESC
    `
    const result = await pool.query(query, [usuario])
    res.status(200).json(result.rows)

  } catch (err) {
    console.error("Erro ao listar minhas inscrições:", err)
    res.status(500).json({ erro: err.message })
  }
}

// BUSCAR POR ID → somente dono ou admin
export const buscarInscricaoPorId = async (req, res) => {
  const permitido = await verificarPermissao(req, res)
  if (!permitido) return

  buscarColunaPorId(req, res, ent)
}

// CRIAR INSCRIÇÃO
export const criarInscricao = async (req, res) => {
  const usuario = req.userId
  let { id_evento } = req.body

  if (req.userTipo !== "organizador") {
    req.body.id_usuario = usuario
    req.body.status = "pendente"

    if (!id_evento || isNaN(parseInt(id_evento))) {
      return res.status(400).json({ erro: "id_evento inválido ou não informado." })
    }
    id_evento = parseInt(id_evento)
    req.body.id_evento = id_evento

    const evento = await pool.query(
      "SELECT visibilidade FROM evento WHERE id_evento = $1 AND visibilidade != 'excluido'",
      [id_evento]
    )

    if (evento.rowCount === 0) {
      return res.status(404).json({ erro: "Evento não encontrado." })
    }

    if (evento.rows[0].visibilidade !== "publico") {
      return res.status(403).json({ erro: "Você só pode se inscrever em eventos públicos." })
    }

    const papel = await pool.query(
      "SELECT 1 FROM evento_usuario WHERE id_evento = $1 AND id_usuario = $2 AND visibilidade != 'excluido'",
      [id_evento, usuario]
    )

    if (papel.rowCount > 0) {
      return res.status(403).json({ erro: "Você já possui papel neste evento e não pode se inscrever novamente." })
    }

    const inscricao = await pool.query(
      "SELECT 1 FROM inscricao WHERE id_evento = $1 AND id_usuario = $2 AND visibilidade != 'excluido'",
      [id_evento, usuario]
    )

    if (inscricao.rowCount > 0) {
      return res.status(403).json({ erro: "Você já está inscrito neste evento." })
    }
  }

  criarColuna(req, res, ent)
}

// =====================
// FUNÇÕES AUXILIARES PAPEL ALTO
// =====================

// Verifica se o usuário logado é organizador ou moderador de um evento específico
async function verificarPapelEvento(req, res, idEvento) {
  const papelRes = await pool.query(
    "SELECT 1 FROM evento_usuario WHERE id_evento = $1 AND id_usuario = $2 AND papel IN ('organizador','moderador') AND visibilidade != 'excluido'",
    [idEvento, req.userId]
  )

  if (papelRes.rowCount === 0) {
    res.status(403).json({ erro: "Você não tem permissão para gerenciar ou visualizar inscrições deste evento." })
    return false
  }

  return true
}

// Função auxiliar para verificar papel alto com base em inscrição
async function verificarPapelAlto(req, res, idInscricao) {
  const inscricaoRes = await pool.query(
    "SELECT id_evento FROM inscricao WHERE id_inscricao = $1 AND visibilidade != 'excluido'",
    [idInscricao]
  )

  if (inscricaoRes.rowCount === 0) {
    res.status(404).json({ erro: "Inscrição não encontrada." })
    return false
  }

  const idEvento = inscricaoRes.rows[0].id_evento
  const permitido = await verificarPapelEvento(req, res, idEvento)
  if (!permitido) return false

  return idEvento
}

// =====================
// LISTAR INSCRIÇÕES DE UM EVENTO (ORGANIZADOR/MODERADOR)
// =====================
export const listarInscricoesEvento = async (req, res) => {
  const idEvento = parseInt(req.params.idEvento)
  if (isNaN(idEvento)) {
    return res.status(400).json({ erro: "ID do evento inválido." })
  }

  // Verifica se o evento existe
  const eventoRes = await pool.query(
    "SELECT id_evento FROM evento WHERE id_evento = $1 AND visibilidade != 'excluido'",
    [idEvento]
  )

  if (eventoRes.rowCount === 0) {
    return res.status(404).json({ erro: "Evento não encontrado." })
  }

  // Verifica se usuário logado tem papel alto no evento
  const permitido = await verificarPapelEvento(req, res, idEvento)
  if (!permitido) return

  try {
    const inscricoes = await pool.query(
      "SELECT * FROM inscricao WHERE id_evento = $1 AND visibilidade != 'excluido' ORDER BY id_inscricao DESC",
      [idEvento]
    )

    res.status(200).json(inscricoes.rows)
  } catch (err) {
    console.error("Erro ao listar inscrições do evento:", err)
    res.status(500).json({ erro: err.message })
  }
}

// =====================
// ACEITAR / RECUSAR INSCRIÇÃO
// =====================

export const aceitarInscricao = async (req, res) => {
  const idInscricao = parseInt(req.params.id)
  const idEvento = await verificarPapelAlto(req, res, idInscricao)
  if (!idEvento) return

  try {
    await pool.query(
      "UPDATE inscricao SET status = 'confirmada' WHERE id_inscricao = $1",
      [idInscricao]
    )

    // ============================
    // AQUI PRECISAMOS IMPLEMENTAR A ADIÇÃO DO USUÁRIO AO EVENTO_USUARIO
    // Exemplo de comentário explicativo:
    // 1. Criar registro em evento_usuario para este usuário, associando ao evento.
    // 2. Definir papel padrão (ex: 'participante') ou de acordo com regras do evento.
    // 3. Garantir visibilidade = 'ativo' e data_atribuicao = now()
    // 4. Lembrar que esta parte NÃO ESTÁ IMPLEMENTADA NESTE MOMENTO.
    // ============================

    res.status(200).json({ sucesso: "Inscrição aprovada com sucesso!" })
  } catch (err) {
    console.error("Erro ao aprovar inscrição:", err)
    res.status(500).json({ erro: err.message })
  }
}

export const recusarInscricao = async (req, res) => {
  const idInscricao = parseInt(req.params.id)
  const idEvento = await verificarPapelAlto(req, res, idInscricao)
  if (!idEvento) return

  try {
    await pool.query(
      "UPDATE inscricao SET status = 'cancelada' WHERE id_inscricao = $1",
      [idInscricao]
    )

    res.status(200).json({ sucesso: "Inscrição recusada com sucesso!" })
  } catch (err) {
    console.error("Erro ao recusar inscrição:", err)
    res.status(500).json({ erro: err.message })
  }
}
