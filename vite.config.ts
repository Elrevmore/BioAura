import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
        '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
        '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      open: true,
    },
    preview: {
      port: 4173,
      host: true,
    },
    build: {
      target: 'es2022',
      sourcemap: env.VITE_SOURCEMAP === 'true',
      chunkSizeWarningLimit: 750,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/three')) {
              return 'three';
            }
            if (
              id.includes('node_modules/@react-three/fiber') ||
              id.includes('node_modules/@react-three/drei')
            ) {
              return 'r3f';
            }
            if (id.includes('node_modules/@mediapipe')) {
              return 'mediapipe';
            }
            if (id.includes('node_modules/framer-motion')) {
              return 'motion';
            }
          },
        },
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.0.0'),
      __BUILD_MODE__: JSON.stringify(mode),
    },
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
    },
  };
});
