// Autoria de Paulista
const inventory = [
  {
    id: "001",
    name: "Cabo HDMI 2m",
    category: "Eletrônicos",
    quantity: 10,
    value: "45.00",
    editableBy: ["admin", "rick"],
    isDeleted: false,
    createdAt: new Date("2025-10-01T10:00:00Z"),
    updatedAt: new Date("2025-10-01T10:00:00Z"),
    editLogEncrypted: "mocked-log-data-1",
  },
  {
    id: "002",
    name: "Mousepad Gamer",
    category: "Periféricos",
    quantity: 5,
    value: "59.90",
    editableBy: ["admin"],
    isDeleted: true,
    createdAt: new Date("2025-10-05T12:00:00Z"),
    updatedAt: new Date("2025-10-05T12:00:00Z"),
    editLogEncrypted: "mocked-log-data-2",
  },
  {
    id: "003",
    name: "Fone de Ouvido Bluetooth",
    category: "Áudio",
    quantity: 8,
    value: "129.99",
    editableBy: ["admin", "izidio"],
    isDeleted: false,
    createdAt: new Date("2025-10-05T09:15:00Z"),
    updatedAt: new Date("2025-10-05T09:15:00Z"),
    editLogEncrypted: "mocked-log-data-3",
  }
];
// Funções presentes no Mock: Criar Item, Ler Item, Editar Item, Deletar Item (soft delete), Mover Item.

//cade o comentario nessa desgraça
//472616c1a8f9ba24820965661ee68d9f3d74860c

//Método de auto incremento de um id (sempre que um item for criado, o novo item vai receber id+1)
let nextId = inventory.length + 1;
const generateId = () => {
  const newId = `${String(nextId++).padStart(3, '0')}`;
  return newId;
}

//  Função de Criar Item
export const criarItem = (newItemData, userRole) => {
  // Valida as Permissões
  if (userRole !== 'admin') {
    throw new Error("Permissão negada. Apenas 'admin' pode criar.");
  }

  // Validação de Dados Obrigatórios
  if (!newItemData.name || !newItemData.value) {
    throw new Error("Nome e valor são obrigatórios.");
  }

  // Cria o Objeto Item
  const item = {
    id: generateId(),
    name: newItemData.name,
    category: newItemData.category || "Sem categoria",
    quantity: newItemData.quantity ?? 0,
    value: newItemData.value || "NULL",
    editableBy: newItemData.editableBy || ["admin"],
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    editLogEncrypted: "mocked-log-data-temp",
  };

  // Adiciona ao Inventário
  inventory.push(item);

  // Retorna o Item Criado
  return item;
};

//  Função de Ler item
export const lerItem = (id, userRole) => {
  const item = inventory.find (i => i.id === id); // Busca o Item pelo Id
    
  if (!item) {
    throw new Error ("Item não encontrado ou Inexistente!") // Valida se o Item existe
  };
    
  if (!item.editableBy.includes(userRole)) {
    throw new Error ("Permissão negada para visualizar item.") // Valida quem pode visualizar o Item
  };

  const status = item.isDeleted ? "inativo" : "ativo"; // Adicionei uma variáevel para mostrar o status do Item

  return{
    ...item,
    status,
  }
}

// Função de Editar Item
export const editarItem = (id, updates, userRole) => {
  const item = inventory.find(i => i.id === id);// Busca o Item pelo Id
  if (!item) {
    throw new Error("Item não encontrado ou inexistente."); //Verifica se o item existe
  }

  if (!item.editableBy.includes(userRole)) {
    throw new Error("Permissão negada para editar este item."); //Verifica se o usuário tem permissão para editar
  }

  const camposEditaveis = ["name", "category", "quantity", "value"]; // Atualiza os campos permitidos
  for (const key of Object.keys(updates)) { 
    if (camposEditaveis.includes(key)) { 
      item[key] = updates[key]; // Aplica as atualizações permitidas
    }
  }

  item.updatedAt = new Date(); // Atualiza a data de modificação
  item.editLogEncrypted = `mocked-edit-log-${Date.now()}`; // Atualiza o log de edição

  return item; //retorna o item atualizado
};

// Função de Deletar Item (soft delete)
export const deletarItem = (id, userRole) => {
  const item = inventory.find(i => i.id === id);  // Busca o Item pelo Id
  if (!item) {
    throw new Error("Item não encontrado ou inexistente."); //Verifica se o item existe
  };

  if (!item.editableBy.includes(userRole)) {
    throw new Error("Permissão negada para deletar este item."); //Verifica se o usuário tem permissão para deletar
  }
  if (item.isDeleted) {
    throw new Error("Item já está deletado."); //Verifica se o item já está deletado
  };
  item.isDeleted = true; // Marca o item como deletado
  item.updatedAt = new Date(); // Atualiza a data de modificação
  item.editLogEncrypted = `mocked-delete-log-${Date.now()}`; // Atualiza o log de edição
  
  return {
  message: `Item "${item.name}" (ID: ${id}) foi marcado como inativo .`,
  item,
  };
};

  // Função de Mover Item (alterar categoria)
export const moverItem = (id, novaCategoria, userRole) => {
  
  const item = inventory.find(i => i.id === id);// Busca o item pelo Id

  if (!item) {
    throw new Error("Item não encontrado ou inexistente."); //Verifica se o item existe
  };

  if (!item.editableBy.includes(userRole)) {
    throw new Error("Permissão negada para mover este item."); //Verifica a permissão
  }

  if (item.isDeleted) {
    throw new Error("Não é possível mover um item inativo."); //Verifica se o item ta ativo ou inativo
  }
};
item.category = novaCategoria
item.updatedAt = new Date ();
item.editLogEncrypted = `mocked-move-log-${Date.now()}`; // simula um log de alteração

return {
    message: `Item "${item.name}" (ID: ${id}) movido para a categoria "${novaCategoria}".`,
    item,
  };

export { inventory };
