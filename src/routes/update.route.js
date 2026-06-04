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
            download_url: { type: 'string' }
          }
        }
      }
    }
  }, updateController.checkUpdate);
}

module.exports = updateRoutes;
