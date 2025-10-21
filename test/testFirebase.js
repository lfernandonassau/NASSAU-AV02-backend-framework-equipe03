// test/testFirebase.js

const { db } = require('../src/services/firebase');

async function test() {
  const ref = db.ref('teste');
  await ref.set({ mensagem: "Conectado com sucesso!" });
  console.log("✅ Dados enviados para o Firebase!");
}

test();
