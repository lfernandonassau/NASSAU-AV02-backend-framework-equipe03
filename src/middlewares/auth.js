//Autoria do CT
//Arquivo de middleware para autenticação de usuários (global)

const loggedUsers = new Set(); //Armazena tokens ativos (simples mock)

module.exports = (req, res, next) => {
  // Exclui rota de login da verificação
  if (req.path === '/api/auth/login') return next();

  const token = req.headers['authorization'];
  if (!token || !loggedUsers.has(token)) {
    return res.status(401).json({ error: 'Não autorizado. Faça login via POST /api/auth/login com username=admin & password=admin' });
  }

  // Token válido
  next();
  
};

// Export para manipulação do login
module.exports.loggedUsers = loggedUsers;
