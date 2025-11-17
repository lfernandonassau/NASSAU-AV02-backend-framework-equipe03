// src/controllers/genericController.js
// RESPONSÁVEL: Richard
// Controlador genérico para qualquer entidade – Feito para tratar toda a lógica básica repetitiva

let entidade            // String com nome técnico da entidade (ex.: 'usuario', 'inscricao')
let entidade_nome       // String com nome gramático da entidade (ex.: 'Usuário', 'Inscrição')
let atributos = []      // Objeto contendo os atributos obrigatórios da entidade
let atributos_opcionais = [] // Objeto contendo os atributos nullable/opcionais da entidade

let subst_f = false     // Define se o nome da entidade é um substantivo feminino para mensagens de retorno.
let entidade_plural = entidade_nome + 's' // String com plural do nome da entidade. Pode ser alterado opcionalmente para plurais que não tem apenas um 's' no final. Ex.:  "Inscrições", "Locais"

let isAdmin = false     // Define se o usuário é um admin (A ser implementado)

let o = (subst_f != true) ? "o" : "a" // Artigo variável
let e = (subst_f != true) ? "e" : "a" // Artigo variável

import { pool } from '../config/db.js'

export function Entidade(_entidade, _entidade_nome, _substfem, _atributos, _atributos_opcionais = [], _entidade_plural = `${_entidade_nome}s`){
  this.entidade = _entidade
  this.entidade_nome = _entidade_nome
  this.subst_f = _substfem
  this.atributos = _atributos
  this.atributos_opcionais = _atributos_opcionais
  this.entidade_plural = _entidade_plural
}

// Define os dados da entidade selecionada, deve ser chamado antes de *qualquer* outra função
export const definirEntidade = async (ent) => {
  entidade = ent.entidade
  entidade_nome = ent.entidade_nome
  entidade_plural = ent.entidade_plural

  if (ent.subst_f == true){subst_f = true}

  atributos = []; atributos_opcionais = []; // Reinicializa os atributos, isso é necessário pra evitar um bug causado pela persistência dos valores entre requisições

  for (const att of ent.atributos) {
    atributos.push(att)
  }

  for (const att of ent.atributos_opcionais) {
    atributos_opcionais.push(att)
  }

  // Redeclarando os artigos variáveis
  o = (subst_f != true) ? "o" : "a"
  e = (subst_f != true) ? "e" : "a"

  console.log(`Entidade definida. Nome: ${entidade} (${entidade_nome}) Plural(${entidade_plural});
    Substantivo feminino: ${subst_f};
    Atributos: ${atributos}; ${atributos_opcionais}`)
}

// Buscar coluna por ID, feita para ser utilizada em todas as consultas de ID (Importar caso o controller haja a própria lógica e precise dessa consulta)
export const IDQuery = async (id, ent) => { if (ent !== 0){definirEntidade(ent)} 
  let output = [] // [código de status HTTP, corpo da resposta (JSON)]

  // Verifica se id é um número inteiro
  if (typeof parseFloat(id) !== "number" || Number.isInteger(parseFloat(id)) !== true) {
    output[0] = 400; output[1] = { Erro: `O ID d${o} ${entidade_nome.toLowerCase()} deve ser um número inteiro.` }
    return output
  }

  try {
    const result = await pool.query(`SELECT * FROM ${entidade} WHERE id_${entidade} = ${id}`)

    if (result.rows.length < 1 || result.rows[0].visibilidade === "excluido") {
      // Equivalente de res.status(404).json()
      output[0] = 404; 
      output[1] = { Erro: `Não existe ${entidade_nome.toLowerCase()} com ID '${id}.'` } // Ex.: "Não existe usuário com ID '69'."
      return output
    }
    
    if (result.rows[0].visibilidade === "inativo" || result.rows[0].status_interno !== "normal") {
      let status = result.rows[0].visibilidade === "inativo" ? "inativo" : result.rows[0].status_interno // Prioriza a visibilidade 'inativa' sobre o status interno
      
      status = status.slice(0, status.length -1).padEnd(status.length, "a") // Tornando status em um substantivo feminino

      // Equivalente de res.status(403).json()
      output[0] = 403; 
      output[1] = { Erro: `Est${e} ${entidade_nome.toLowerCase()} está ${status}.` } // Ex.: "Este usuário está bloqueado" ou "Esta inscrição está bloqueada"
      return output
    }


    // Equivalente de res.status(200).json()
    output[0] = 200; 
    output[1] = result.rows[0]
    return output
  } 
  catch (err) {
    console.error(`IDQuery (${entidade}):`, err.message)
    // Equivalente de res.status(500).json()
    output[0] = 500; 
    output[1] = { error: err.message } 
    return output
  }
}

// Listar as colunas da entidade
export const listarColunas = async (req, res, ent) => { definirEntidade(ent)
  let admin_check = `WHERE visibilidade != 'excluido'`
  // Permite ver dados formalmente excluídos caso o requisitor seja um administrador. TODO: adicionar checagem real pra usuário admin
  if (isAdmin == true){
    admin_check = ""
  }

  try {
    const result = await pool.query(`SELECT * FROM ${entidade} ${admin_check} ORDER BY id_${entidade} ASC`)
    res.json(result.rows)
  } catch (err) {
    console.error(`Erro ao listar ${entidade_plural.toLowerCase()}.`, err.message) // Ex.: "Erro ao listar usuários." ou "Erro ao listar locais."
    res.status(500).json({ error: `Erro ao listar ${entidade_plural.toLowerCase()}.` })
  }
}


// Criar nova coluna na entidade
export const criarColuna = async (req, res, ent) => { definirEntidade(ent)
  // Verifica se todos os atributos obrigatórios estão preenchidos no corpo da requisição
  for (const att of atributos) {
    let value_filled
    for (const body_att of Object.keys(req.body)) {
      if (att === body_att){
        console.log(att, "existe")
        value_filled = true
        break
      }
    }
    if (value_filled !== true){
      return res.status(400).json({ erro: `Os campos ${atributos} devem estar preenchidos.` })
    }
  }
  console.log("atributos validados")
  
  // Verifica se há e consulta atributos com "id_" no nome como forma de checar por chaves estrangeiras.
  if (atributos.toString().includes('id_')){
    let fkquery = await foreignKeyIDQuery(Object.entries(req.body))
    if (fkquery !== 1){
      res.status(400).json(fkquery)
      return
    }
  }

  // Formata os valores para coincidirem com a sintaxe de SQL
  let formatted_values = []
  for (const value of Object.values(req.body)) {
    formatted_values.push(value.padStart(value.length + 1, "'").padEnd(value.length + 2, "'")) // tem jeitos bem melhores de fazer isso mas tô com preguiça de refatorar essa única linha
  }

  try {
    const result = await pool.query(`
      INSERT INTO ${entidade} (${Object.keys(req.body) + ""})
      VALUES (${formatted_values + ""})
      RETURNING *;
    `)
    
    res.status(201).json({
      message: `${entidade_nome} criad${o} com sucesso.`,
      result: result.rows[0]
    })
  } catch (err) {
    console.error(`Erro ao criar ${entidade_nome.toLowerCase()}:`, err.message)
    res.status(500).json({ error: `Erro ao criar ${entidade_nome.toLowerCase()}: ${err.message}` })
  }
}

// Buscar coluna por ID, chamada pela rota 
export const buscarColunaPorId = async (req, res, ent) => {
  const { id } = req.params

  const user_search = await IDQuery(id, ent)
  res.status(user_search[0]).json(user_search[1])
}

// Atualizar coluna com novos dados
export const atualizarColuna = async (req, res, ent) => {
  const { id } = req.params
  
  const id_query = await IDQuery(id, ent)
  if (id_query[0] !== 200) {
    res.status(id_query[0]).json(id_query[1])
    return
  }

  if (Object.keys(req.body).length < 1){
    res.status(201).json({error: 'Nenhum campo preenchido para atualizar.'})
    return
  }

  // Verifica se há e consulta atributos com "id_" no nome como forma de checar por chaves estrangeiras.
  if (atributos.toString().includes('id_')){
    let fkquery = await foreignKeyIDQuery(Object.entries(req.body))
    if (fkquery !== 1){
      res.status(400).json(fkquery)
      return
    }
  }

  // Formata os valores para coincidirem com a sintaxe de SQL
  let formatted_values = ""

  for (const entry of Object.entries(req.body)) {
    formatted_values = formatted_values + (entry[0] + "=" + `'${entry[1]}',`)
  }
  formatted_values = formatted_values.slice(0, formatted_values.length - 1) // Remove a última vírgula

  try {
    const result = await pool.query(`
      UPDATE ${entidade}
      SET ${formatted_values}
      WHERE id_${entidade} = ${id}
      RETURNING *;
    `)
    
    res.status(201).json({
      message: `${entidade_nome} atualizad${o} com sucesso.`,
      result: result.rows[0]
    })
  } catch (err) {
    console.error(`Erro ao atualizar ${entidade_nome.toLowerCase}:`, err.message)
    res.status(500).json({ error: `Erro ao atualizar ${entidade_nome.toLowerCase}: ${err.message}` })
  }
}

// Deletar coluna (Tornar inacessível a uso livre, ao invés de verdadeiramente deletar)
export const deletarColuna = async (req, res, ent) => {
  const { id } = req.params

  const user = await IDQuery(id, ent)
  if (user[0] !== 200) {
    res.status(user[0]).json(user[1])
    return
  }

  try {
    await pool.query(`UPDATE ${entidade} SET visibilidade = 'excluido' WHERE id_${entidade} = ${id};`)
    res.status(200).json(`${entidade_nome} apagad${o} com sucesso.`)
  } catch (err) {
    console.error(`Erro ao apagar ${entidade_nome.toLowerCase()}:`, err.message)
    res.status(500).json({ error: `Erro ao apagar ${entidade_nome.toLowerCase()}: ${err.message}` })
  }
}

// Consultas de ID para chaves estrangeiras centralizadas em uma função
const foreignKeyIDQuery = async (entries) => {
  let revert = entidade
  let returned_errors = []

  for (const att of entries) {
    if (att[0].includes('id_')){
      entidade = att[0].substring(3, att[0].length)
      let query = await IDQuery(att[1], 0)

      if (query[0] != 200){
        // AVISO: Essa implementação não define as variáveis gramáticas da entidade sendo consultada, então o console vai enviar a mensagem como se fosse a entidade original
        console.error(`FK (${att[0]}) IDQuery:`, query[1])
        returned_errors.push(att[0])
      }
    }
  } entidade = revert

  //
  if (returned_errors.length != 0){
    let s = returned_errors.length > 1 ? "s" : ""
    return { error: `Erro ao consultar o${s} campo${s} (${returned_errors}). Consulte-o${s} individualmente para mais detalhes.` }
  } else {
    return 1
  }
}