// Autoria do Richard - comentários sem minha assinatura implicitamente são meus
// Arquivo servindo como controlador para o endpoint do serviço de itens

//importando os métodos genéricos do Firebase (substituindo services antigos) #CT
const { create, read, update, remove, moveDrawer } = require('../services/firebase'); // #CT
const services = require('../services/Inventario'); // Import dos serviços de itens
const { loggedUsers } = require('../middlewares/auth');
const users = loggedUsers.loggedUsers // Import da coleção de tokens válidos/usuários logados

const best_test_request = (req, res) => {
    res.json({"message": "you have been returned with the bestest testest requestest"})
};

// Cria um item
const createItem = (req, res) => {
    const { name } = req.body
    const { category } = req.body
    const { quantity } = req.body
    const { editableBy } = req.body
    const { value } = req.body
    const item = {name, category, quantity, editableBy, value}
    const token = req.get("Authorization")  // URGENT: Os serviços precisam validar o editableBy baseado no set loggedUsers;
    let fake_token = 'admin'                // Até lá, eu vou usar essa variável provisória

    const new_item = services.criarItem(item, fake_token) // substituir segundo argumento por token quando o problema for resolvido
    res.status(200).send(new_item)
}

// Seleciona um item pelo ID
const getItemById = (req, res) => {
    const { id } = req.params
    const token = req.get("Authorization")
    let fake_token = 'admin'

    const item = services.lerItem(id, fake_token) 

    res.status(200).send(item)
}

// Lista os itens; opcionalmente filtrados por parâmetros de query
const listItems = (req, res) => {
    const filter = req.query

    console.log(filter)
    // Necessita de uma função dos serviços; Retorna um bule de chá enquanto isso
    res.status(418).send('You found a TEAPOT! It was not added to your inventory.')
}

const updateItem = (req, res) => {
    // Necessita de uma função dos serviços; Retorna um bule de chá azul enquanto isso
    res.status(418).send('You found a BLUE TEAPOT! It was not added to your inventory.')
}

const deleteItem = (req, res) => {
    // Necessita de uma função dos serviços; Retorna um bule de chá escarlate enquanto isso
    res.status(418).send('You found a SCARLET TEAPOT! It was not added to your inventory.')
}

const moveItem = (req, res) => {
    // Necessita de uma função dos serviços; Retorna um bule de chá de duas pernas enquanto isso
    res.status(418).send('You found a 2-LEGGED TEAPOT! It was not added to your inventory.')
}

// Essa função pode ser descartada futuramente
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

/* // --- FUNÇÕES MOCK PARA CRUD DE ITENS #PAULISTA
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
} */


const requestValidator = (req, res) => {
    // Checa se o pedido foi enviado em formato JSON
    if (req.is('json') === false){
        res.status(400).send('Invalid request: Not in JSON format.')
        return
    };

    // Checa se a quantidade de chaves dentro do request em JSON está correta; Quantidade final ainda não definida
    if (Object.keys(req.body).length !== 2){
        let amount
        if (Object.keys(req.body).length < 2){
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
    listItems,
    createItem,
    getItemById,
    updateItem,
    deleteItem,
    moveItem,
    best_test_request
};

// código carece da implementação completa dos serviços para ser finalizado
