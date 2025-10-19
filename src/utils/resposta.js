//Autoria do CT
//Arquivo de resposta padronizada para as rotas

exports.success = (res, data, message = 'Sucesso') => {
  res.json({ status: 'success', message, data });
};

exports.error = (res, message = 'Erro', code = 500) => {
  res.status(code).json({ status: 'error', message });
};
