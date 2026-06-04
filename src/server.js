const buildApp = require('./app');

async function start() {
  const app = buildApp();

  try {
    await app.listen({
      host: app.config.host,
      port: app.config.port,
    });

    app.log.info(`Server berjalan di http://localhost:${app.config.port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();
