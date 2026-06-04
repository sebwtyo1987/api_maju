const { getHealth } = require('./health.controller');

async function healthRoutes(fastify) {
  fastify.get('/health', getHealth);
}

module.exports = healthRoutes;
