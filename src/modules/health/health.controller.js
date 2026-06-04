const { getHealthStatus } = require('./health.service');

async function getHealth(request, reply) {
  return reply.send(getHealthStatus(request.server.config));
}

module.exports = {
  getHealth,
};
