//Autoria do CT
//Arquivo de logging de requisições para o servidor


module.exports = (req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url}`);
  next();
};