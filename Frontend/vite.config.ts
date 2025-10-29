import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
      },
    },
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
    },
    server: {
      port: 5000,
      open: true,
    },
    define: {
      'import.meta.env.VITE_CONTRACT_ADDRESS': JSON.stringify(env.CONTRACT_ADDRESS),
      'import.meta.env.VITE_PINATA_API_KEY': JSON.stringify(env.VITE_PINATA_API_KEY),
      'import.meta.env.VITE_PINATA_API_SECRET': JSON.stringify(env.VITE_PINATA_API_SECRET),
      'import.meta.env.VITE_PINATA_JWT': JSON.stringify(env.VITE_PINATA_JWT),
    },
  };
});
