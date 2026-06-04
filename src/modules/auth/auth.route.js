const authController = require('../../controller/auth.controller');

async function authRoutes(fastify) {
  fastify.post('/login', authController.loginHandler);
}

module.exports = authRoutes;
