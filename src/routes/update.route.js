const updateController = require('../controller/update.controller');

async function updateRoutes(fastify) {
  fastify.get('/check', {
    schema: {
      description: 'Mengecek ketersediaan update aplikasi terbaru',
      tags: ['Update'],
      response: {
        200: {
          type: 'object',
          properties: {
            app_name: { type: 'string' },
            app_version: { type: 'string' },
            download_url: { type: 'string' },
            download: { type: 'boolean' }
          }
        }
      }
    }
  }, updateController.checkUpdate);
}

module.exports = updateRoutes;
