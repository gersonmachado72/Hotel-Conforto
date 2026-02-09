const jwt = require('jsonwebtoken');

module.exports = {
  // Middleware para verificar token JWT
  authenticateToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token de acesso não fornecido' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Token inválido ou expirado' });
      }
      req.user = user;
      next();
    });
  },
  
  // Middleware para verificar permissões de admin
  isAdmin: (req, res, next) => {
    if (req.user && req.user.cargo === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Acesso restrito a administradores' });
    }
  },
  
  // Middleware para verificar se é funcionário
  isStaff: (req, res, next) => {
    const staffRoles = ['admin', 'gerente', 'recepcionista'];
    if (req.user && staffRoles.includes(req.user.cargo)) {
      next();
    } else {
      res.status(403).json({ error: 'Acesso restrito a funcionários' });
    }
  }
};
