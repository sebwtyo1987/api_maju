const appRoutes = require('../modules/app/app.route');
const v1Routes = require('./v1');

async function routes(fastify) {
  await fastify.register(appRoutes);
  await fastify.register(v1Routes, { prefix: '/api/v1' });
}

module.exports = routes;
