import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Native filesystem events can fail on the Windows network drive.
      usePolling: true,
      interval: 300,
      binaryInterval: 1000,
    },
  },
});
