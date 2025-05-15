import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'show-server-url',
      configureServer(server) {
        const originalListen = server.listen.bind(server);
        server.listen = async (...args) => {
          const httpServer = await originalListen(...args);
          const addresses = server.resolvedUrls?.local ?? [];
          console.clear();
          console.log('\n  🎵 Muski Music App Running at:\n');
          addresses.forEach(addr => {
            console.log(`  ➜ Local:   ${addr}`);
          });
          console.log('\n  Ready for development!\n');
          return httpServer;
        };
      },
    }
  ],
  server: {
    host: true, // Allow access from network
    port: 3001,
    strictPort: true, // Exit if port is in use
    open: true, // Open browser on startup
    clearScreen: false
  },
  build: {
    // Add clean option to handle permission issues
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    force: true // Force dependency optimization
  }
});
