//Arquivo: src/controllers/itemController.js
//Autoria do CT

const { get } = require('mongoose');
const services = require('../services/nome'); // Import dos serviços que estão pra ser implementados


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
const listItems = (req, res) => {
    res.json([{ id: 1, name: "Item de teste" }]);
};

const createItem = (req, res) => {
    const data = req.body;
    const item = services.criarItem(data);
    res.json(item);
};

const getItemById = (req, res) => {
    const { id } = req.params;
    const item = services.lerItem(id);
    res.json(item);
};

const updateItem = (req, res) => {
    res.json({ message: `Item ${req.params.id} atualizado (mock)` });
};

const deleteItem = (req, res) => {
    res.json({ message: `Item ${req.params.id} deletado (mock)` });
};

const moveItem = (req, res) => {
    res.json({ message: `Item ${req.params.id} movido (mock)` });
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
