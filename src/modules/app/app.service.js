function getAppInfo(config) {
  return {
    message: `Selamat datang di API ${config.appName}!`,
    environment: config.nodeEnv,
    docs: {
      healthcheck: '/api/v1/health',
    },
  };
}

module.exports = {
  getAppInfo,
};
