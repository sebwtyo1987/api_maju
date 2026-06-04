const { getAppStatus } = require('./app.controller');

async function appRoutes(fastify) {
  fastify.get('/', getAppStatus);
}

module.exports = appRoutes;
