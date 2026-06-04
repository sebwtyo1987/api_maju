const { getAppInfo } = require('./app.service');

async function getAppStatus(request, reply) {
  return reply.send(getAppInfo(request.server.config));
}

module.exports = {
  getAppStatus,
};
