// Serviço temporário para testes #PAULISTA

const criarItem = (data) => {
    console.log('Serviço criarItem chamado com:', data);
    return { success: true, data };
};

const lerItem = (id) => {
    console.log('Serviço lerItem chamado com id:', id);
    return { id, name: 'Item de teste' };
};

module.exports = {
    criarItem,
    lerItem
};
