const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://backend:8000', // исправлено с localhost на backend
      changeOrigin: true,
      secure: false,
    })
  );
};
