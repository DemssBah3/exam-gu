#!/usr/bin/env node
/**
 * Script de démarrage simple du serveur Exam-GU
 */
const config = require('./config');
const logger = require('./logger');
const ExpressServer = require('./expressServer');

console.log('🚀 Démarrage du serveur Exam-GU...');

const launchServer = async () => {
  try {
    const expressServer = new ExpressServer(config.URL_PORT, config.OPENAPI_YAML);
    expressServer.launch();
    logger.info('✅ Serveur lancé avec succès sur le port ' + config.URL_PORT);
  } catch (error) {
    logger.error('❌ Erreur lors du démarrage du serveur:', error.message);
    process.exit(1);
  }
};

launchServer().catch((err) => {
  logger.error('❌ Erreur fatale:', err);
  process.exit(1);
});

// Gestion des arrêts gracieux
process.on('SIGTERM', () => {
  logger.info('SIGTERM reçu, arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT reçu, arrêt du serveur...');
  process.exit(0);
});
