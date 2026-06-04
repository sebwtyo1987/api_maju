const fp = require('fastify-plugin');
const path = require('path');
const errorHandlerPlugin = require('./error-handler');
const dbConnectorPlugin = require('./db-connector');

async function appPlugins(fastify) {

  // Register CORS agar Swagger UI bisa memanggil API
  await fastify.register(require('@fastify/cors'), {
    origin: true, // Mengikuti origin dari request (sangat fleksibel untuk dev)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    preflightContinue: false
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
        { url: 'http://localhost:3456' } // Sesuaikan dengan port yang Anda gunakan
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

  // Register static untuk folder download aplikasi
  await fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, '..', 'updates', 'download'),
    prefix: '/updates/download/',
    decorateReply: false // Menghindari konflik jika plugin lain sudah menggunakan static
  });
}

module.exports = fp(appPlugins);