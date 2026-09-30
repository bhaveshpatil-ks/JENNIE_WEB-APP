import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Reverse proxy target configurable via environment variable VITE_BACKEND_PROXY_TARGET
  const proxyTarget = env.VITE_BACKEND_PROXY_TARGET || 'http://localhost:5000';

  return {
    base: './',
    plugins: [react()],
    server: {
      port: 5173,
      open: true,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
          configure: (proxy) => {
            proxy.on('error', (err, _req, res) => {
              if (res && !res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Proxy backend unavailable' }));
              }
            });
          },
        },
      },
    },
  };
});
