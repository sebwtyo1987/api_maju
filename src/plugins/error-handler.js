async function errorHandlerPlugin(fastify) {
  fastify.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    const statusCode = error.statusCode || 500;

    return reply.status(statusCode).send({
      message: error.message || 'Internal Server Error',
    });
  });
}

module.exports = errorHandlerPlugin;
