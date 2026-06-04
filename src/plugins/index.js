const fp = require('fastify-plugin');
const errorHandlerPlugin = require('./error-handler');
const dbConnectorPlugin = require('./db-connector');

async function appPlugins(fastify) {

  // Register CORS agar Swagger UI bisa memanggil API
  await fastify.register(require('@fastify/cors'), {
    origin: true // Mengizinkan semua origin selama masa pengembangan
  });

  // 🔥 Swagger (harus di atas sebelum routes)
  await fastify.register(require('@fastify/swagger'), {
    openapi: {
      info: {
        title: 'API Maju Makmur',
        description: 'Dokumentasi API Aplikasi',
        version: '1.0.0'
      },
      servers: [
        { url: 'http://localhost:3001' } // Sesuaikan dengan port yang Anda gunakan
      ]
    }
  });

  await fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true
    }
  });

  // plugin lain
  await fastify.register(errorHandlerPlugin);
  await fastify.register(dbConnectorPlugin);
}

module.exports = fp(appPlugins);