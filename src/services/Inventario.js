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

//cade o comentario nessa desgraça
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

  // 2. Validação de Dados Obrigatórios
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
    throw new Error ("Permissão negada para visualizar item.") // Valida quem pode vizualizar o Item
  };

  const status = item.isDeleted ? "inativo" : "ativo"; // Adicionei uma variáevel para mostrar o status do Item

  return{
    ...item,
    status,
  }
}



export { inventory };
