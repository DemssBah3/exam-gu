const http = require('http');
const fs = require('fs');
const path = require('path');
const swaggerUI = require('swagger-ui-express');
const jsYaml = require('js-yaml');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const OpenApiValidator = require('express-openapi-validator');
const logger = require('./logger');
const config = require('./config');
const { verifyToken } = require('./middleware/auth');

class ExpressServer {
  constructor(port, openApiYaml) {
    this.port = port;
    this.app = express();
    this.openApiPath = openApiYaml;
    try {
      this.schema = jsYaml.safeLoad(fs.readFileSync(openApiYaml));
    } catch (e) {
      logger.error('failed to start Express Server', e.message);
    }
    this.setupMiddleware();
  }

  setupMiddleware() {
    // ==========================================
    // MIDDLEWARE DE BASE
    // ==========================================
    this.app.use(cors());
    this.app.use(bodyParser.json({ limit: '14MB' }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());

    // ==========================================
    // ROUTES PUBLIQUES (AVANT L'AUTHENTIFICATION)
    // ==========================================
    
    // Test simple
    this.app.get('/hello', (req, res) => {
      res.send(`Hello World. Server is running. OpenAPI path: ${this.openApiPath}`);
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Envoyer le document OpenAPI
    this.app.get('/openapi', (req, res) => {
      res.sendFile(path.join(__dirname, 'api', 'openapi.yaml'));
    });

    // Interface Swagger UI
    this.app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(this.schema));

    // OAuth redirects
    this.app.get('/login-redirect', (req, res) => {
      res.status(200).json(req.query);
    });

    this.app.get('/oauth2-redirect.html', (req, res) => {
      res.status(200).json(req.query);
    });

   // ==========================================
// MIDDLEWARE D'AUTHENTIFICATION JWT
// ==========================================
this.app.use((req, res, next) => {
  // Liste des routes publiques (pas d'authentification requise)
  const publicPaths = [
    '/api/v1/auth/login',  // Seulement le login est public
    '/hello',
    '/health',
    '/openapi',
    '/api-docs',
    '/login-redirect',
    '/oauth2-redirect.html',
  ];

  // Vérifier si la route actuelle est publique
  const isPublic = publicPaths.includes(req.path) || 
                   publicPaths.some(p => !p.startsWith('/api/v1') && req.path.startsWith(p));

  // Log pour debug
  logger.info(`${req.method} ${req.path} - Public: ${isPublic}`);

  // Si la route est publique, passer sans vérification
  if (isPublic) {
    logger.info(`✅ Route publique autorisée: ${req.path}`);
    return next();
  }

  // Si la route commence par /api/v1, vérifier le token JWT
  if (req.path.startsWith('/api/v1')) {
    logger.info(`🔒 Route protégée, vérification du token: ${req.path}`);
    return verifyToken(req, res, next);
  }

  // Pour toutes les autres routes, passer sans vérification
  next();
});


    // ==========================================
    // OPENAPI VALIDATOR
    // ==========================================
    this.app.use(
      OpenApiValidator.middleware({
        apiSpec: this.openApiPath,
        operationHandlers: path.join(__dirname),
        fileUploader: { dest: config.FILE_UPLOAD_PATH },
        validateRequests: true,
        validateResponses: false,
        validateSecurity: false,
      }),
    );

    // ==========================================
    // INJECTION DES INFOS UTILISATEUR (APRÈS OpenAPI Validator)
    // ==========================================
    this.app.use((req, res, next) => {
      if (req.user) {
        // OpenAPI Validator a déjà créé req.openapi
        if (!req.openapi) {
          req.openapi = {};
        }
        req.openapi.userId = req.user.userId;
        req.openapi.role = req.user.role;
        logger.info(`👤 User injected into openapi: ${req.openapi.userId} (${req.openapi.role})`);
      }
      next();
    });
  }

  launch() {
    // ==========================================
    // GESTION DES ERREURS GLOBALES
    // ==========================================
    this.app.use((err, req, res, next) => {
      // Log l'erreur complète
      console.error('='.repeat(60));
      console.error('❌ ERROR DETAILS:');
      console.error('Path:', req.path);
      console.error('Method:', req.method);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      console.error('Error object:', err);
      console.error('='.repeat(60));

      logger.error(`Error on ${req.method} ${req.path}:`, err.message);

      // Erreur de validation OpenAPI
      if (err.status === 400 && err.errors) {
        return res.status(400).json({
          message: 'Validation error',
          errors: err.errors,
        });
      }

      // Erreur d'authentification
      if (err.status === 401) {
        return res.status(401).json({
          message: err.message || 'Unauthorized',
          errors: err.errors || [],
        });
      }

      // Erreur d'autorisation
      if (err.status === 403) {
        return res.status(403).json({
          message: err.message || 'Forbidden',
          errors: err.errors || [],
        });
      }

      // Erreur générique
      res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        errors: err.errors || '',
        ...(process.env.NODE_ENV === 'development' && { 
          stack: err.stack 
        }),
      });
    });

    // ==========================================
    // DÉMARRAGE DU SERVEUR
    // ==========================================
    this.server = http.createServer(this.app).listen(this.port, () => {
      logger.info('='.repeat(60));
      logger.info(`🚀 Exam-GU Server Started Successfully`);
      logger.info('='.repeat(60));
      logger.info(`📍 Server URL:        http://localhost:${this.port}`);
      logger.info(`📚 API Base:          http://localhost:${this.port}/api/v1`);
      logger.info(`🏥 Health Check:      http://localhost:${this.port}/health`);
      logger.info(`📖 API Docs:          http://localhost:${this.port}/api-docs`);
      logger.info(`📄 OpenAPI Spec:      http://localhost:${this.port}/openapi`);
      logger.info('='.repeat(60));
      logger.info(`🔐 Public Routes:`);
      logger.info(`   - POST /api/v1/auth/login (Login)`);
      logger.info(`   - GET  /hello (Test)`);
      logger.info(`   - GET  /health (Health)`);
      logger.info('='.repeat(60));
    });
  }

  async close() {
    if (this.server !== undefined) {
      await this.server.close();
      logger.info(`Server on port ${this.port} shut down`);
    }
  }
}

module.exports = ExpressServer;
