/* eslint-disable no-unused-vars */
const Service = require('./Service');
const { getDatabase } = require('../db/database');
const { generateToken } = require('../middleware/auth');
const passwordUtils = require('../utils/passwordUtils');  // ✅ AJOUTER CETTE LIGNE

/**
 * Historique des connexions
 * Retourne le journal des connexions de l'utilisateur
 */
/**
 * Get login history for a user
 */
const authLoginHistoryGET = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();

      // Extraire userId de différentes sources possibles
      const userId = params.userId || params.openapi?.userId || params.user?.userId;

      console.log('📜 Getting login history for userId:', userId);

      if (!userId) {
        console.log('❌ No userId found in params');
        return reject(Service.rejectResponse(
          'User ID not found',
          401,
        ));
      }

      // ✅ FIX: Utiliser la bonne méthode
      const logs = db.getLoginLogsByUser(userId);

      console.log('✅ Login history retrieved:', logs.length, 'entries');

      // Formater les logs selon le schéma OpenAPI (LoginLog)
      const formattedLogs = logs.map((log) => ({
        id: log.id,
        timestamp: log.timestamp,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
      }));

      resolve(Service.successResponse(formattedLogs));
    } catch (error) {
      console.error('❌ Error fetching login history:', error);
      reject(Service.rejectResponse(
        error.message || 'Failed to fetch login history',
        error.status || 500,
      ));
    }
  },
);

/**
 * Se connecter
 * Authentifier un utilisateur et obtenir un token JWT
 * 🔐 AVEC BCRYPT POUR SÉCURISER LES MOTS DE PASSE
 */
const authLoginPOST = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();
      
      // Extraire email et password
      let email, password;
      
      if (params.authLoginPostRequest) {
        email = params.authLoginPostRequest.email;
        password = params.authLoginPostRequest.password;
      } else if (params.body) {
        email = params.body.email;
        password = params.body.password;
      } else if (params.email) {
        email = params.email;
        password = params.password;
      } else {
        return reject(Service.rejectResponse(
          'Email and password are required',
          400,
        ));
      }

      console.log('🔐 Login attempt for:', email);

      if (!email || !password) {
        return reject(Service.rejectResponse(
          'Email and password are required',
          400,
        ));
      }

      // Vérifier l'email
      const user = db.getUserByEmail(email);
      if (!user) {
        console.warn('❌ User not found:', email);
        return reject(Service.rejectResponse(
          'Invalid email or password',
          401,
        ));
      }

      // 🔐 VÉRIFIER LE MOT DE PASSE AVEC BCRYPT (au lieu de comparaison simple)
      const passwordMatch = await passwordUtils.comparePassword(password, user.password);
      
      if (!passwordMatch) {
        console.warn('❌ Invalid password for:', email);
        return reject(Service.rejectResponse(
          'Invalid email or password',
          401,
        ));
      }

      // Générer le token JWT
      const token = generateToken(user.id, user.role);

      // Ajouter un log de connexion
      db.addLoginLog(user.id, '127.0.0.1', 'API');

      console.log('✅ Login successful:', email, '- Role:', user.role);

      // Retourner le token et les infos utilisateur
      const responseUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt,
      };

      resolve(Service.successResponse({
        token,
        user: responseUser,
      }));
    } catch (e) {
      console.error('❌ Login error:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Authentication failed',
        e.status || 500,
      ));
    }
  },
);

/**
 * Se déconnecter
 * Terminer la session utilisateur
 */
const authLogoutPOST = () => new Promise(
  async (resolve, reject) => {
    try {
      console.log('👋 User logged out');
      resolve(Service.successResponse({ message: 'Logged out successfully' }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Logout failed',
        e.status || 500,
      ));
    }
  },
);

/**
 * Obtenir le profil courant
 * Retourne les informations de l'utilisateur connecté
 */
const authMeGET = (params) => new Promise(
  async (resolve, reject) => {
    try {
      const db = getDatabase();

      // Extraire userId de différentes sources possibles
      const userId = params.userId || params.openapi?.userId || params.user?.userId;

      console.log('👤 Getting profile - Params keys:', Object.keys(params));
      console.log('👤 UserId extracted:', userId);

      if (!userId) {
        console.error('❌ No userId found in params:', JSON.stringify(params, null, 2));
        return reject(Service.rejectResponse(
          'User ID not found',
          401,
        ));
      }

      const user = db.getUserById(userId);
      if (!user) {
        console.error('❌ User not found in database:', userId);
        return reject(Service.rejectResponse(
          'User not found',
          404,
        ));
      }

      console.log('✅ Profile found for:', user.email);

      const responseUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt,
      };

      resolve(Service.successResponse(responseUser));
    } catch (e) {
      console.error('❌ Error in authMeGET:', e.message);
      reject(Service.rejectResponse(
        e.message || 'Failed to get user profile',
        e.status || 500,
      ));
    }
  },
);

module.exports = {
  authLoginHistoryGET,
  authLoginPOST,
  authLogoutPOST,
  authMeGET,
};
