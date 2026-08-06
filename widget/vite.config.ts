import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  // 👇 Ye add karo
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },

  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.tsx"),
      name: "PSEBChatbot",
      fileName: () => "chatbot.js",
      formats: ["iife"],
    },

    cssCodeSplit: false,

    rollupOptions: {
      output: {
        assetFileNames: "chatbot.[ext]",
      },
    },
  },
});