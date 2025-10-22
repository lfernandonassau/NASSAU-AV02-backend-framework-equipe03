//test/run-test.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const testDir = path.join(__dirname, 'test');
const files = fs.readdirSync(testDir).filter(f => f.endsWith('.js')); // Lista arquivos .js no diretório de testes

console.log('Selecione o arquivo para testar:');
files.forEach((f, i) => console.log(`${i + 1}. ${f}`));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Digite o número do arquivo: ', (num) => {
  const index = parseInt(num) - 1;
  if (files[index]) {
    require(path.join(testDir, files[index]));
  } else {
    console.log('Número inválido.');
  }
  rl.close();
});
