// src/controllers/eventoController.js
// RESPONSÁVEL GERAL: Richard
// RESPONSÁVEL ATUALIZAÇÕES DE VALIDAÇÃO DE HORÁRIOS: CT
// RESPONSÁVEL GERAL: CT

import {
  Entidade,
  IDQuery,
  listarColunas,
  buscarColunaPorId,
  deletarColuna,
  validarExistenciaAtiva
} from "./genericController.js"

import { pool } from '../config/db.js'

const ent = new Entidade(
  'evento',
  'Evento',
  false,
  ['titulo', 'data_inicio', 'data_fim', 'id_local', 'id_categoria'],
  ['descricao']
)

const eventoIDQuery = async (id) => IDQuery(id, ent)

// 1) Listar eventos
export const listarEventos = async (req, res) => {
  try {
    const isAdmin = req.userTipo === "organizador"

    let query = ""
    let params = []

    if (isAdmin) {
      // ADMIN → vê absolutamente TUDO
      query = `
        SELECT *
        FROM evento
        ORDER BY data_inicio ASC;
      `
    } else {
      // USUÁRIO COMUM → só eventos público
      query = `
        SELECT *
        FROM evento
        WHERE visibilidade = 'publico'
        ORDER BY data_inicio ASC;
      `
    }

    const result = await pool.query(query, params)
    res.json(result.rows)

  } catch (err) {
    console.error("Erro ao listar eventos:", err)
    res.status(500).json({ erro: err.message })
  }
}

// 2) Buscar evento por id
export const buscarEventoPorId = async (req, res) => {
  buscarColunaPorId(req, res, ent)
}

// 3) Criar evento (validações completas, horário incluso)
export const criarEvento = async (req, res) => {
  try {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({
        erro: "Usuário não autenticado.",
        detalhes: "Inclua um token JWT válido no header Authorization."
      })
    }

    const {
      titulo,
      descricao,
      data_inicio,
      data_fim,
      id_local,
      id_categoria,
      visibilidade
    } = req.body

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        erro: "Nenhum dado fornecido na requisição.",
        mensagem: "Para criar um evento, envie os campos obrigatórios.",
        obrigatorios: {
          titulo: "string (não pode ser vazio)",
          data_inicio: "YYYY-MM-DDTHH:mm",
          data_fim: "YYYY-MM-DDTHH:mm",
          id_local: "number",
          id_categoria: "number",
          visibilidade: "publico | privado"
        },
        opcionais: { descricao: "string" }
      })
    }

    if (!titulo || typeof titulo !== "string" || titulo.trim() === "") {
      return res.status(400).json({
        erro: "Título é obrigatório e não pode ser vazio."
      })
    }

    if (!data_inicio || !data_fim) {
      return res.status(400).json({
        erro: "Datas de início e fim são obrigatórias."
      })
    }

    const dtInicio = new Date(data_inicio)
    const dtFim = new Date(data_fim)
    if (isNaN(dtInicio) || isNaN(dtFim)) {
      return res.status(400).json({
        erro: "Datas inválidas."
      })
    }

    const agora = new Date()
    if (
      dtInicio.toDateString() === agora.toDateString() &&
      dtInicio.getTime() < agora.getTime() + 5 * 60 * 1000
    ) {
      return res.status(400).json({
        erro: "Se o evento for hoje, o horário deve ser pelo menos 5 minutos à frente do horário atual."
      })
    }

    if (dtFim < dtInicio) {
      return res.status(400).json({
        erro: "data_fim não pode ser antes de data_inicio."
      })
    }

    if (!visibilidade || !["publico", "privado"].includes(visibilidade.toLowerCase())) {
      return res.status(400).json({
        erro: "Valor inválido ou ausente para 'visibilidade'."
      })
    }

    if (!id_local || !id_categoria) {
      return res.status(400).json({
        erro: "id_local e id_categoria são obrigatórios."
      })
    }

    await validarExistenciaAtiva('local', 'id_local', id_local)
    await validarExistenciaAtiva('categoria', 'id_categoria', id_categoria)

    // Inserir evento
    const queryEvento = `
      INSERT INTO evento
      (titulo, descricao, data_inicio, data_fim, id_local, id_categoria, id_usuario_criador, visibilidade)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *;
    `
    const values = [
      titulo.trim(),
      descricao || null,
      dtInicio,
      dtFim,
      id_local,
      id_categoria,
      userId,
      visibilidade.toLowerCase()
    ]

    const result = await pool.query(queryEvento, values)
    const eventoCriado = result.rows[0]

    // Inserir automaticamente o criador na tabela unificada evento_usuario
    const insertUsuarioEvento = `
      INSERT INTO evento_usuario
      (id_evento, id_usuario, papel, is_criador, convite_status, data_atribuicao)
      VALUES ($1, $2, 'organizador', TRUE, 'NAO', NOW())
    `
    await pool.query(insertUsuarioEvento, [eventoCriado.id_evento, userId])

    res.status(201).json({
      mensagem: "Evento criado com sucesso.",
      evento: eventoCriado,
      organizador: { id_usuario: userId, papel: "organizador", criador: true }
    })

  } catch (err) {
    console.error("Erro ao criar evento:", err)
    res.status(500).json({ erro: err.message })
  }
}

// 4) Atualizar evento (validações de horário incluídas)
export const atualizarEvento = async (req, res) => {
  try {
    const id = req.params.id
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({
        erro: "Usuário não autenticado."
      })
    }

    const evento = await eventoIDQuery(id)
    if (!evento) {
      return res.status(404).json({ erro: "Evento não encontrado.", id_recebido: id })
    }

    const {
      titulo,
      descricao,
      data_inicio,
      data_fim,
      id_local,
      id_categoria,
      visibilidade
    } = req.body

    // Valida datas caso sejam fornecidas
    let dtInicio = data_inicio ? new Date(data_inicio) : new Date(evento.data_inicio)
    let dtFim = data_fim ? new Date(data_fim) : new Date(evento.data_fim)

    if ((data_inicio || data_fim) && (isNaN(dtInicio) || isNaN(dtFim))) {
      return res.status(400).json({ erro: "Datas inválidas." })
    }

    const agora = new Date()
    if (
      dtInicio.toDateString() === agora.toDateString() &&
      dtInicio.getTime() < agora.getTime() + 5 * 60 * 1000
    ) {
      return res.status(400).json({
        erro: "Se o evento for hoje, o horário deve ser pelo menos 5 minutos à frente do horário atual."
      })
    }

    if (dtFim < dtInicio) {
      return res.status(400).json({
        erro: "data_fim não pode ser antes de data_inicio."
      })
    }

    if (visibilidade !== undefined && !["publico", "privado"].includes(visibilidade.toLowerCase())) {
      return res.status(400).json({
        erro: "Valor inválido para 'visibilidade'.",
      })
    }

    if (id_local !== undefined) await validarExistenciaAtiva('local', 'id_local', id_local)
    if (id_categoria !== undefined) await validarExistenciaAtiva('categoria', 'id_categoria', id_categoria)

    // Monta UPDATE dinamicamente
    const campos = []
    const valores = []
    let idx = 1

    const mapping = { titulo, descricao, data_inicio: dtInicio, data_fim: dtFim, id_local, id_categoria, visibilidade }
    for (const key in mapping) {
      if (mapping[key] !== undefined) {
        campos.push(`${key} = $${idx}`)
        valores.push(mapping[key])
        idx++
      }
    }

    if (campos.length === 0) {
      return res.status(400).json({ erro: "Nenhum dado enviado para atualização." })
    }

    valores.push(id)
    const query = `
      UPDATE evento
      SET ${campos.join(', ')}
      WHERE id_evento = $${idx}
      RETURNING *
    `
    const result = await pool.query(query, valores)

    res.json({ mensagem: "Evento atualizado com sucesso!", evento: result.rows[0] })

  } catch (err) {
    console.error("Erro ao atualizar evento:", err)
    res.status(500).json({ erro: "Erro interno ao atualizar evento.", detalhes: err.message })
  }
}

// 5) Excluir evento
export const excluirEvento = async (req, res) => {
  deletarColuna(req, res, ent)
}

// 6) Ver papel do usuário no evento
export const verMeuPapelNoEvento = async (req, res) => {
  try {
    const userId = req.userId
    const { id_evento } = req.params

    if (!userId) {
      return res.status(401).json({ erro: "Usuário não autenticado." })
    }

    const query = `
      SELECT papel, is_criador, convite_status, data_atribuicao
      FROM evento_usuario
      WHERE id_evento = $1 AND id_usuario = $2
    `

    const result = await pool.query(query, [id_evento, userId])

    if (result.rowCount === 0) {
      return res.status(404).json({ mensagem: "Você não possui papel neste evento." })
    }

    res.status(200).json({
      id_evento,
      id_usuario: userId,
      ...result.rows[0]
    })

  } catch (err) {
    res.status(500).json({ erro: err.message })
  }
}
