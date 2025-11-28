// src/controllers/conviteController.js
// RESPONSÁVEL GERAL: Richard
// RESPONSÁVEL GERAL: CT

import {
  Entidade,
  IDQuery,
  listarColunas,
  criarColuna,
  deletarColuna
} from "./genericController.js"

import { pool } from '../config/db.js'

const ent = new Entidade(
  'convite_evento',
  'Convite_evento',
  false,
  [
    'id_evento',
    'id_usuario_convidado',
    'id_usuario_remetente',
    'status',
    'expiracao',
    'observacao',
    'assento',
    'secao',
    'papel_sugerido'
  ]
)

const conviteIDQuery = async (id) => IDQuery(id, ent)

// PERMISSÕES E UTILIDADE
const usuarioTemPapelEvento = async (id_evento, id_usuario) => {
  const query = `
    SELECT papel, is_criador
    FROM evento_usuario
    WHERE id_evento = $1 AND id_usuario = $2
      AND (papel IN ('organizador', 'moderador') OR is_criador = true)
  `
  const result = await pool.query(query, [id_evento, id_usuario])
  return result.rows.length > 0
}

const conviteJaExiste = async (id_evento, id_usuario_convidado) => {
  const result = await pool.query(
    `SELECT * FROM convite_evento
     WHERE id_evento = $1 AND id_usuario_convidado = $2`,
    [id_evento, id_usuario_convidado]
  )
  return result.rows[0] || null
}

const assentoOcupado = async (id_evento, secao, assento) => {
  const query = `
    SELECT *
    FROM evento_participacao
    WHERE id_evento = $1 AND secao = $2 AND assento = $3
  `
  const result = await pool.query(query, [id_evento, secao, assento])
  return result.rows.length > 0
}

// FUNÇÃO CENTRAL DE PERMISSÃO PARA GERENCIAR CONVITES
const podeGerenciarConvite = async (id_evento, id_usuario) => {
  // 1 - Checar se usuário é organizador global
  const result = await pool.query(
    `SELECT tipo FROM usuarios WHERE id_usuario = $1`,
    [id_usuario]
  )
  const tipo = result.rows[0]?.tipo
  if (tipo === 'organizador') return true

  // 2 - Checar se usuário é organizador ou moderador no evento
  const temPermissaoEvento = await usuarioTemPapelEvento(id_evento, id_usuario)
  return temPermissaoEvento
}

// 1 LISTAR TODOS
export const listarConvites = async (req, res) => {
  listarColunas(req, res, ent)
}

// 2 RECEBIDOS
export const listarConvitesRecebidos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM convite_evento
      WHERE id_usuario_convidado = $1
      ORDER BY data_envio DESC
    `, [req.userId])

    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
}

export const listarConvitesRecebidosDeUsuario = async (req, res) => {
  const { id_usuario } = req.params
  try {
    const result = await pool.query(`
      SELECT *
      FROM convite_evento
      WHERE id_usuario_convidado = $1
      ORDER BY data_envio DESC
    `, [id_usuario])

    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
}

// 3 ENVIADOS
export const listarConvitesEnviados = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM convite_evento
      WHERE id_usuario_remetente = $1
      ORDER BY data_envio DESC
    `, [req.userId])

    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
}

export const listarConvitesEnviadosDeUsuario = async (req, res) => {
  const { id_usuario } = req.params
  try {
    const result = await pool.query(`
      SELECT *
      FROM convite_evento
      WHERE id_usuario_remetente = $1
      ORDER BY data_envio DESC
    `, [id_usuario])

    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
}

// 4 LISTAR POR EVENTO
export const listarConvitesPorEvento = async (req, res) => {
  const { id_evento } = req.params
  const userId = req.userId

  const temPermissao = await podeGerenciarConvite(id_evento, userId)
  if (!temPermissao)
    return res.status(403).json({ erro: "Sem permissão para ver convites deste evento." })

  try {
    const result = await pool.query(`
      SELECT *
      FROM convite_evento
      WHERE id_evento = $1
      ORDER BY data_envio DESC
    `, [id_evento])

    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
}

export const listarConvitesPorEventoDeUsuario = async (req, res) => {
  const { id_evento, id_usuario } = req.params
  const userId = req.userId

  const temPermissao = await podeGerenciarConvite(id_evento, userId)
  if (!temPermissao)
    return res.status(403).json({ erro: "Sem permissão para ver convites deste evento." })

  try {
    const result = await pool.query(`
      SELECT *
      FROM convite_evento
      WHERE id_evento = $1 AND id_usuario_convidado = $2
      ORDER BY data_envio DESC
    `, [id_evento, id_usuario])

    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
}

// 5 BUSCAR POR ID
export const buscarConvitePorId = async (req, res) => {
  const { id } = req.params
  const userId = req.userId

  const convite = await conviteIDQuery(id)
  if (convite[0] !== 200) return res.status(convite[0]).json(convite[1])

  const c = convite[1]

  const dono = c.id_usuario_convidado === userId
  const remetente = c.id_usuario_remetente === userId
  const papelEvento = await usuarioTemPapelEvento(c.id_evento, userId)

  if (!dono && !remetente && !papelEvento)
    return res.status(403).json({ erro: "Você não pode ver este convite." })

  res.json(c)
}

// 6 - CRIAR CONVITE (BODY NORMAL)
export const criarConvite = async (req, res) => {
  const { id_evento, id_usuario_convidado } = req.body
  const remetente = req.userId

  const temPermissao = await podeGerenciarConvite(id_evento, remetente)
  if (!temPermissao)
    return res.status(403).json({ erro: "Sem permissão para convidar neste evento." })

  const existente = await conviteJaExiste(id_evento, id_usuario_convidado)
  if (existente)
    return res.status(400).json({ erro: "Usuário já foi convidado.", convite_existente: existente })

  req.body.id_usuario_remetente = remetente
  req.body.status = "enviado"

  criarColuna(req, res, ent)
}

// 6B CRIAR CONVITE VIA URL
export const criarConviteDiretoEventoUsuario = async (req, res) => {
  const { id_evento, id_usuario } = req.params
  const remetente = req.userId

  const temPermissao = await podeGerenciarConvite(id_evento, remetente)
  if (!temPermissao)
    return res.status(403).json({ erro: "Sem permissão para convidar neste evento." })

  const existente = await conviteJaExiste(id_evento, id_usuario)
  if (existente)
    return res.status(400).json({ erro: "Já existe convite para este usuário.", convite_existente: existente })

  const convite = {
    id_evento,
    id_usuario_convidado: id_usuario,
    id_usuario_remetente: remetente,
    status: "enviado",
    expiracao: req.body.expiracao || null,
    observacao: req.body.observacao || null,
    assento: req.body.assento || null,
    secao: req.body.secao || null,
    papel_sugerido: req.body.papel_sugerido || null
  }

  try {
    const result = await pool.query(`
      INSERT INTO convite_evento
      (id_evento, id_usuario_convidado, id_usuario_remetente, status, expiracao, observacao, assento, secao, papel_sugerido)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `, [
      convite.id_evento,
      convite.id_usuario_convidado,
      convite.id_usuario_remetente,
      convite.status,
      convite.expiracao,
      convite.observacao,
      convite.assento,
      convite.secao,
      convite.papel_sugerido
    ])

    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
}

// 7 ACEITAR CONVITE
export const aceitarConvite = async (req, res) => {
  const { id } = req.params
  const usuario = req.userId

  const conv = await conviteIDQuery(id)
  if (conv[0] !== 200) return res.status(conv[0]).json(conv[1])
  const c = conv[1]

  if (c.id_usuario_convidado !== usuario)
    return res.status(403).json({ erro: "Somente o convidado pode aceitar." })

  if (c.status === "aceito")
    return res.status(400).json({ erro: "Este convite já foi aceito." })
  if (c.status === "recusado")
    return res.status(400).json({ erro: "Este convite já foi recusado e não pode ser aceito." })
  if (c.status === "expirado")
    return res.status(400).json({ erro: "Este convite expirou e não pode ser aceito." })

  if (c.assento && c.secao) {
    const ocupado = await assentoOcupado(c.id_evento, c.secao, c.assento)
    if (ocupado)
      return res.status(400).json({ erro: "Este assento já está ocupado." })
  }

  try {
    const papel = c.papel_sugerido || "participante"
    await pool.query(`
      INSERT INTO evento_usuario
      (id_evento, id_usuario, papel, is_criador, convite_status, origem_convite, assento, secao, data_atribuicao)
      VALUES ($1,$2,$3,false,'ACEITO',$4,$5,$6,NOW())
      ON CONFLICT (id_evento, id_usuario)
      DO UPDATE SET
        papel = EXCLUDED.papel,
        convite_status = 'ACEITO',
        origem_convite = EXCLUDED.origem_convite,
        assento = EXCLUDED.assento,
        secao = EXCLUDED.secao,
        visibilidade = 'ativo',
        status_interno = 'normal'
    `, [c.id_evento, usuario, papel, c.id_convite_evento, c.assento, c.secao])

    await pool.query(`
      UPDATE convite_evento
      SET status = 'aceito'
      WHERE id_convite_evento = $1
    `, [id])

    res.json({
      mensagem: "Convite aceito. Participação criada/atualizada em evento_usuario.",
      papel_aplicado: papel
    })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
}

// 9 RECUSAR CONVITE
export const recusarConvite = async (req, res) => {
  const { id } = req.params
  const usuario = req.userId

  const conv = await conviteIDQuery(id)
  if (conv[0] !== 200) return res.status(conv[0]).json(conv[1])
  const c = conv[1]

  if (c.id_usuario_convidado !== usuario)
    return res.status(403).json({ erro: "Somente o convidado pode recusar." })

  if (c.status === "recusado")
    return res.status(400).json({ erro: "Este convite já foi recusado." })
  if (c.status === "aceito")
    return res.status(400).json({ erro: "Este convite já foi aceito e não pode ser recusado." })
  if (c.status === "expirado")
    return res.status(400).json({ erro: "Este convite expirou e não pode ser recusado." })

  try {
    await pool.query(`
      UPDATE convite_evento
      SET status = 'recusado'
      WHERE id_convite_evento = $1
    `, [id])

    res.json({ mensagem: "Convite recusado." })
  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
}

// 8 ATUALIZAR STATUS
export const atualizarConvite = async (req, res) => {
  const { id } = req.params
  const { status } = req.body
  const usuario = req.userId

  const convite = await conviteIDQuery(id)
  if (convite[0] !== 200) return res.status(convite[0]).json(convite[1])
  const c = convite[1]

  const temPermissao = await podeGerenciarConvite(c.id_evento, usuario)
  if (!temPermissao && c.id_usuario_convidado !== usuario)
    return res.status(403).json({ erro: "Sem permissão para atualizar este convite." })

  if (!["enviado", "aceito", "recusado", "expirado"].includes(status))
    return res.status(400).json({ erro: "Status inválido." })

  await pool.query(`
    UPDATE convite_evento
    SET status = $1
    WHERE id_convite_evento = $2
  `, [status, id])

  res.json({ mensagem: "Status atualizado." })
}

// 10 EXCLUIR
export const excluirConvite = async (req, res) => {
  const { id } = req.params
  const usuario = req.userId

  const convite = await conviteIDQuery(id)
  if (convite[0] !== 200) return res.status(convite[0]).json(convite[1])
  const c = convite[1]

  const temPermissao = await podeGerenciarConvite(c.id_evento, usuario)
  if (!temPermissao)
    return res.status(403).json({ erro: "Sem permissão para excluir este convite." })

  deletarColuna(req, res, ent)
}
