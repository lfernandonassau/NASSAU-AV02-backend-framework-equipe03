const admin = require('firebase-admin'); // Firebase Admin SDK
const path = require('path'); // resolver caminhos de arquivos

const serviceAccount = require(path.join(__dirname, './config/itemtity_firebase.json'));

// Inicializa o Firebase e guarda a instância em `app`
const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://itemtify-475819-default-rtdb.firebaseio.com/"
});

const db = admin.database(); // referência principal do banco

// CRUD genérico
async function create(path, data) {
    const ref = db.ref(path);
    const result = await ref.push(data);
    return { id: result.key, ...data };
}

async function read(path) {
    const snapshot = await db.ref(path).once('value');
    return snapshot.exists() ? snapshot.val() : null;
}

async function update(path, data) {
    await db.ref(path).update(data);
    return { sucesso: true, atualizado: data };
}

async function remove(path) {
    await db.ref(path).remove();
    return { sucesso: true, removido: path };
}

// Permissões internas
async function checkPermission(userId, collection, action) {
    const snapshot = await db.ref(`permissoes/${userId}`).once('value');
    if (!snapshot.exists()) return false;
    const userPerms = snapshot.val();
    return userPerms[collection]?.includes(action) || false;
}

// mover coleções
async function moveDrawer(from, to, camada = 0) {
    try {
        const fromRef = db.ref(from);
        const toRef = db.ref(to);

        const snapshot = await fromRef.once('value');
        if (!snapshot.exists()) throw new Error(`Coleção de origem não encontrada: ${from}`);
        const dados = snapshot.val();

        let destinoFinal = '';

        if (camada >= 0) {
            // camada >=0 → mover para dentro
            destinoFinal = `${to}/${path.basename(from)}`;
            await db.ref(destinoFinal).set(dados);
            console.log(`📦 Movendo '${path.basename(from)}' PARA dentro de '${to}'`);
        } else {
            // camada <0 → mover para fora
            const partes = from.split('/');
            if (partes.length < 2) throw new Error("Não é possível mover para fora da raiz");
            const nomeColecao = partes.pop();
            const novoDestino = partes.slice(0, partes.length - 1).join('/') || '';
            destinoFinal = `${novoDestino}/${nomeColecao}`.replace(/\/$/, '');
            await db.ref(destinoFinal).set(dados);
            console.log(`📤 Movendo '${nomeColecao}' PARA FORA de '${partes.join('/') || 'raiz'}'`);
        }

        await fromRef.remove();
        console.log(`✅ '${from}' movida para '${destinoFinal}' (camada ${camada})`);
        return { sucesso: true, de: from, para: destinoFinal, camada };

    } catch (error) {
        console.error("❌ Erro ao mover coleção:", error.message);
        return { sucesso: false, erro: error.message };
    }
}

// Export corrigido, incluindo `app` para permitir encerrar a conexão
module.exports = {
    admin,
    app,
    db,
    create, //CRUD ABAIXO
    read,
    update,
    remove,
    checkPermission,
    moveDrawer
};
