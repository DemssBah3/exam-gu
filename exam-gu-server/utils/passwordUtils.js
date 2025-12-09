const bcrypt = require('bcryptjs');

/**
 * Utilitaires pour la gestion sécurisée des mots de passe
 */
const passwordUtils = {
  /**
   * Hasher un mot de passe en texte clair
   * @param {string} plainPassword - Mot de passe en texte clair
   * @returns {Promise<string>} Mot de passe hashé
   */
  hashPassword: async (plainPassword) => {
    try {
      const salt = await bcrypt.genSalt(10); // 10 rounds = bon compromis sécurité/performance
      const hashedPassword = await bcrypt.hash(plainPassword, salt);
      return hashedPassword;
    } catch (error) {
      throw new Error(`Erreur lors du hachage du mot de passe: ${error.message}`);
    }
  },

  /**
   * Comparer un mot de passe en texte clair avec un mot de passe hashé
   * @param {string} plainPassword - Mot de passe en texte clair
   * @param {string} hashedPassword - Mot de passe hashé en base de données
   * @returns {Promise<boolean>} true si les mots de passe correspondent, false sinon
   */
  comparePassword: async (plainPassword, hashedPassword) => {
    try {
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      return isMatch;
    } catch (error) {
      throw new Error(`Erreur lors de la comparaison des mots de passe: ${error.message}`);
    }
  },

  /**
   * Vérifier si un mot de passe est déjà hashé (commence par $2a$, $2b$, $2x$, ou $2y$)
   * @param {string} password - Le mot de passe à vérifier
   * @returns {boolean} true si le mot de passe est hashé
   */
  isHashed: (password) => {
    return /^\$2[aby]\$\d{2}\$/.test(password);
  },
};

module.exports = passwordUtils;
