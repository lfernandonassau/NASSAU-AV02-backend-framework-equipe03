// src/controllers/genericController.js
// RESPONSÁVEL ORIGINAL: Richard
// Controlador genérico para qualquer entidade – Feito para tratar toda a lógica básica repetitiva
// Reestruturado completamente mantendo objetivos originais

import { pool } from '../config/db.js'

// ESTADO INTERNO — NECESSÁRIO PARA ARMAZENAR CONTEXTO DE ENTIDADE

let entidade                      // String com nome técnico da entidade (ex.: 'usuario', 'inscricao')
let entidade_nome                 // String com nome gramático da entidade (ex.: 'Usuário', 'Inscrição')
let atributos = []                // Objeto contendo os atributos obrigatórios da entidade
let atributos_opcionais = []      // Objeto contendo os atributos nullable/opcionais da entidade
let subst_f = false               // Define se o nome da entidade é um substantivo feminino (para mensagens)
let entidade_plural               // Plural, usado para listagens e mensagens
let o = "o"                       // Artigos variáveis (o/a, e/a)
let e = "e"
let isAdmin = false               // Define se o usuário é um admin (TODO: aplicar na autenticação)


// FUNÇÕES AUXILIARES

function extrairTabelaFK(campo) {
  return campo.replace("id_", "").split("_")[0]
}

// Define os dados da entidade selecionada
export function Entidade(_entidade, _entidade_nome, _substfem, _atributos, _atributos_opcionais = [], _entidade_plural = `${_entidade_nome}s`) {
  this.entidade = _entidade
  this.entidade_nome = _entidade_nome
  this.subst_f = _substfem
  this.atributos = _atributos
  this.atributos_opcionais = _atributos_opcionais
  this.entidade_plural = _entidade_plural
}

// Reinicializa variáveis internas
export const definirEntidade = async (ent) => {
  entidade = ent.entidade
  entidade_nome = ent.entidade_nome
  subst_f = ent.subst_f === true
  entidade_plural = ent.entidade_plural

  atributos = [...ent.atributos]
  atributos_opcionais = [...ent.atributos_opcionais]

  o = subst_f ? "a" : "o"
  e = subst_f ? "a" : "e"
}

// CONSULTA POR ID — UTILIZADO TANTO NA ROTA QUANTO POR CHAVE ESTRANGEIRA
export const IDQuery = async (id, ent) => {

  if (ent !== 0) await definirEntidade(ent)

  if (!Number.isInteger(parseFloat(id))) {
    return [
      400,
      { Erro: `O ID d${o} ${entidade_nome.toLowerCase()} deve ser um número inteiro.` }
    ]
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ${entidade} WHERE id_${entidade} = $1`,
      [id]
    )

    if (result.rows.length < 1 || result.rows[0].visibilidade === "excluido") {
      return [
        404,
        { Erro: `Não existe ${entidade_nome.toLowerCase()} com ID '${id}'.` }
      ]
    }

    if (result.rows[0].visibilidade === "inativo" || result.rows[0].status_interno !== "normal") {
      let status =
        result.rows[0].visibilidade === "inativo"
          ? "inativa"
          : result.rows[0].status_interno.replace(/.$/, "a")

      return [
        403,
        { Erro: `Est${e} ${entidade_nome.toLowerCase()} está ${status}.` }
      ]
    }

    return [200, result.rows[0]]

  } catch (err) {
    console.error(`IDQuery (${entidade}):`, err.message)
    return [500, { error: err.message }]
  }
}


// -----------------------------------------------------------------------------
// ⭐ NOVA FUNÇÃO — validarExistenciaAtiva(tabela, campoId, valor)
// Usada para: await validarExistenciaAtiva('local', 'id_local', id_local)
// -----------------------------------------------------------------------------
export const validarExistenciaAtiva = async (tabela, campoId, valor) => {
  try {
    const q = await pool.query(
      `SELECT visibilidade FROM ${tabela} WHERE ${campoId} = $1`,
      [valor]
    )

    if (q.rowCount === 0) {
      return {
        ok: false,
        status: 400,
        erro: `${tabela.charAt(0).toUpperCase() + tabela.slice(1)} informado não existe.`
      }
    }

    const vis = q.rows[0].visibilidade

    if (vis === "excluido" || vis === "inativo") {
      return {
        ok: false,
        status: 403,
        erro: `${tabela.charAt(0).toUpperCase() + tabela.slice(1)} está ${vis}.`
      }
    }

    return { ok: true }

  } catch (err) {
    console.error("Erro validarExistenciaAtiva:", err)
    return {
      ok: false,
      status: 500,
      erro: "Erro interno ao validar existência."
    }
  }
}


// CONSULTA DE FKs
const foreignKeyIDQuery = async (entries) => {

  let entidade_original = entidade
  let erros = []

  for (const [campo, valor] of entries) {
    if (campo.startsWith("id_")) {
      const tabela = extrairTabelaFK(campo)

      try {
        const consulta = await pool.query(
          `SELECT id_${tabela} FROM ${tabela} WHERE id_${tabela} = $1`,
          [valor]
        )

        if (consulta.rows.length < 1) erros.push(campo)
      } catch (err) {
        erros.push(campo)
      }
    }
  }

  entidade = entidade_original

  if (erros.length > 0) {
    const s = erros.length > 1 ? "s" : ""
    return {
      error: `Erro ao consultar o${s} campo${s} (${erros}). Verifique os IDs fornecidos.`
    }
  }

  return 1
}



// LISTAR
export const listarColunas = async (req, res, ent) => {

  await definirEntidade(ent)

  let admin_check = isAdmin ? "" : "WHERE visibilidade != 'excluido'"

  try {
    const result = await pool.query(
      `SELECT * FROM ${entidade} ${admin_check} ORDER BY id_${entidade} ASC`
    )

    res.json(result.rows)

  } catch (err) {
    res.status(500).json({
      error: `Erro ao listar ${entidade_plural.toLowerCase()}.`
    })
  }
}


// CRIAR
export const criarColuna = async (req, res, ent) => {

  await definirEntidade(ent)

  for (const att of atributos) {
    if (!Object.keys(req.body).includes(att)) {
      return res.status(400).json({
        erro: `Os campos ${atributos} devem estar preenchidos.`
      })
    }
  }

  if (Object.keys(req.body).some(k => k.startsWith("id_"))) {
    let fk = await foreignKeyIDQuery(Object.entries(req.body))
    if (fk !== 1) return res.status(400).json(fk)
  }

  const keys = Object.keys(req.body)
  const values = Object.values(req.body)
  const placeholders = keys.map((_, i) => `$${i + 1}`)

  const query = `
    INSERT INTO ${entidade} (${keys.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING *;
  `

  try {
    const result = await pool.query(query, values)
    res.status(201).json({
      message: `${entidade_nome} criad${o} com sucesso.`,
      result: result.rows[0]
    })
  } catch (err) {
    res.status(500).json({
      error: `Erro ao criar ${entidade_nome.toLowerCase()}: ${err.message}`
    })
  }
}


// BUSCAR POR ID
export const buscarColunaPorId = async (req, res, ent) => {
  const { id } = req.params
  const r = await IDQuery(id, ent)
  res.status(r[0]).json(r[1])
}


// ATUALIZAR
export const atualizarColuna = async (req, res, ent) => {

  await definirEntidade(ent)
  const { id } = req.params

  const existe = await IDQuery(id, ent)
  if (existe[0] !== 200) return res.status(existe[0]).json(existe[1])

  if (Object.keys(req.body).length < 1)
    return res.status(400).json({ error: "Nenhum campo enviado." })

  if (Object.keys(req.body).some(k => k.startsWith("id_"))) {
    let fk = await foreignKeyIDQuery(Object.entries(req.body))
    if (fk !== 1) return res.status(400).json(fk)
  }

  const entries = Object.entries(req.body)
  const setClauses = []
  const params = []

  entries.forEach(([key, value], idx) => {
    params.push(value)
    setClauses.push(`${key} = $${idx + 1}`)
  })

  params.push(id)
  const idParam = params.length

  const query = `
    UPDATE ${entidade}
    SET ${setClauses.join(', ')}
    WHERE id_${entidade} = $${idParam}
    RETURNING *;
  `

  try {
    const result = await pool.query(query, params)
    res.status(200).json({
      message: `${entidade_nome} atualizad${o} com sucesso.`,
      result: result.rows[0]
    })
  } catch (err) {
    res.status(500).json({
      error: `Erro ao atualizar ${entidade_nome.toLowerCase()}: ${err.message}`
    })
  }
}


// DELETAR (soft delete)
export const deletarColuna = async (req, res, ent) => {

  await definirEntidade(ent)
  const { id } = req.params

  const existe = await IDQuery(id, ent)
  if (existe[0] !== 200) return res.status(existe[0]).json(existe[1])

  try {
    await pool.query(
      `UPDATE ${entidade} SET visibilidade = 'excluido' WHERE id_${entidade} = $1`,
      [id]
    )

    res.status(200).json(`${entidade_nome} apagad${o} com sucesso.`)

  } catch (err) {
    res.status(500).json({
      error: `Erro ao apagar ${entidade_nome.toLowerCase()}: ${err.message}`
    })
  }
}
