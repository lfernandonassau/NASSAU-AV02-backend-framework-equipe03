// test/testFirebase.js

const { db, app } = require('../src/services/firebase'); // app = admin.initializeApp(...)

async function test() {
  try {
    const ref = db.ref('teste');
    await ref.set({ mensagem: "Conectado com sucesso!" });
    console.log("✅ Dados enviados para o Firebase!");
  } catch (err) {
    console.error("❌ Erro ao enviar dados:", err);
  } finally {
    // Encerra a conexão do Firebase para que o Node finalize o processo
    await app.delete();
    process.exit(0); // força encerramento //
  }
}

test();
