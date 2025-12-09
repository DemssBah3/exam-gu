// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const logger = require('../logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware d'authentification global
 * Vérifie le token pour toutes les routes sauf les routes publiques
 */
const authMiddleware = (req, res, next) => {
  // Routes publiques (pas besoin d'authentification)
  const publicRoutes = ['/api/v1/auth/login'];
  
  logger.info(`${req.method} ${req.path} - Public: ${publicRoutes.includes(req.path)}`);
  
  if (publicRoutes.includes(req.path)) {
    logger.info(`✅ Route publique autorisée: ${req.path}`);
    return next();
  }

  // Routes protégées - vérifier le token
  logger.info(`🔒 Route protégée, vérification du token: ${req.path}`);
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(`⚠️ No token provided for ${req.path}`);
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.substring(7); // Enlever "Bearer "
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Injecter les infos utilisateur dans req.user
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
    
    logger.info(`👤 User injected: ${decoded.userId} (${decoded.role})`);
    
    next();
  } catch (error) {
    logger.error('❌ Invalid token:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
