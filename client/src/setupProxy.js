const { createProxyMiddleware } = require('http-proxy-middleware');


module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000/api',
      changeOrigin: true,
    })
  )
  app.use(
    '/uploads',
    createProxyMiddleware({
      target: 'http://localhost:5000/uploads',
      changeOrigin: true,
    })
  );

};

