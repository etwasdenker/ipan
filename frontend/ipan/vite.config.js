import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@workbench": path.resolve(__dirname, "../../workbench"),
    },
  },
  server: {
    fs: {
      allow: [
        path.resolve(__dirname, "."),
        path.resolve(__dirname, "../../workbench"),
        path.resolve(__dirname, "../.."),
      ],
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@mui/material",
      "@mui/system",
      "@mui/icons-material",
      "@emotion/react",
      "@emotion/styled",
    ],
  },
});
