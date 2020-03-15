const {createProxyMiddleware} = require('http-proxy-middleware');

module.exports = function(app) {
    const optionsAPI = {
        target: 'http://localhost:8888',
        changeOrigin: true,
    }

    const myProxyAPI = createProxyMiddleware(optionsAPI);

    app.use('/api', myProxyAPI );
};