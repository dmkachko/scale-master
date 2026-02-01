import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Plugin to redirect base path without trailing slash
function trailingSlashRedirect() {
  return {
    name: 'trailing-slash-redirect',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Redirect /scale-master to /scale-master/
        if (req.url === '/scale-master') {
          res.writeHead(301, { Location: '/scale-master/' });
          res.end();
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        // Redirect /scale-master to /scale-master/
        if (req.url === '/scale-master') {
          res.writeHead(301, { Location: '/scale-master/' });
          res.end();
          return;
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), trailingSlashRedirect()],
  base: '/scale-master/',
})
