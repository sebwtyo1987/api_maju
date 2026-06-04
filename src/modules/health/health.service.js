function getHealthStatus(config) {
  return {
    status: 'ok',
    app: config.appName,
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  getHealthStatus,
};
