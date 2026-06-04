const Fastify = require('fastify');
const env = require('./config/env');
const plugins = require('./plugins');
const routes = require('./routes');

function buildApp() {
  const app = Fastify({
    logger: {
      level: env.logLevel,
    },
    ajv: {
      customOptions: {
        keywords: ['example']
      }
    }
  });

  app.decorate('config', env);

  app.register(plugins);
  app.register(routes);

  return app;
}

module.exports = buildApp;
