//Arquivo: src/controllers/itemController.js
//Autoria do CT

const { get } = require('mongoose');
//importando os métodos genéricos do Firebase (substituindo services antigos)
const { create, read, update, remove, moveDrawer } = require('../services/firebase'); // #CT


const best_test_request = (req, res) => {
    res.json({"message": "you have been returned with the bestest testest requestest"})
};

const postFunction = (req, res) => {
    const { id } = req.params;
    const { panty } = req.body; // Nome de variável provisório
    const { stocking } = req.body; // Nome de variável provisório
    const curry = Object.entries(req.query); // Retorna query em formato de array

    if (requestValidator(req, res) !== true){
        return
    }
    getItemMetadata(id, panty, stocking, curry)

    res.json({
        tits: `hey ${id}, we got your ${panty} and ${stocking}`, 
    })
}

// --- FUNÇÕES MOCK PARA CRUD DE ITENS #PAULISTA
const listItems = async (req, res) => {
    try {
        const data = await read('itens'); //lendo todos os itens da coleção "itens"
        res.json(data || []);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

const createItem = async (req, res) => {
    try {
        const data = req.body;
        const item = await create('itens', data); //criando item no banco
        res.json(item);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

const getItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await read(`itens/${id}`); //lendo item específico
        if (!item) return res.status(404).json({ erro: 'Item não encontrado' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        await update(`itens/${id}`, data); //atualizando item no banco
        res.json({ message: `Item ${id} atualizado com sucesso!` });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        await remove(`itens/${id}`); //removendo item do banco
        res.json({ message: `Item ${id} deletado com sucesso!` });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

const moveItem = async (req, res) => {
    try {
        const { from, to, camada } = req.body; //caminhos passados no body
        const result = await moveDrawer(from, to, camada || 0); //movendo item entre coleções
        res.json(result);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
}


const requestValidator = (req, res) => {
    // Checa se o pedido foi enviado em formato JSON
    if (req.is('json') === false){
        res.status(400).send('Invalid request: Not in JSON format.')
        return
    };

    // Checa se a quantidade de chaves dentro do request em JSON está correta; Quantidade final ainda não definida
    if (Object.keys(req.body).length !== 2){
        let amount = Object.keys(req.body).length
        if (amount < 2){
            amount = "few"
        } else {
            amount = "many"
        }
        res.status(406).send(`Invalid request: Too ${amount} keys (${Object.keys(req.body).length}) in request.`)
        return
    }

    // Checa se todos os valores são strings
    for (value of Object.values(req.body)){
        if(typeof value !== 'string'){
            res.status(422).send('Invalid request: Every value must be formatted as a string.')
            return
        }
    };
    
    return true
};

module.exports = {
    best_test_request,
    postFunction,
    listItems,
    createItem,
    getItemById,
    updateItem,
    deleteItem,
    moveItem
};

// Função temporária enquanto o Paulista não faz os serviços

const getItemMetadata = (id, arg1, arg2, query) => {
    console.log("Request successfully received with:", id, arg1, arg2, query)
}

// OBS: eu REALMENTE preciso das rotas e dos serviços pra fazer toda a integração desse sistema de forma fiel
//captado
