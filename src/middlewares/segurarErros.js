//Autoria do CT
//Arquivo de middleware para captura e tratamento de erros

module.exports = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Ocorreu um erro no servidor', details: err.message });
};
