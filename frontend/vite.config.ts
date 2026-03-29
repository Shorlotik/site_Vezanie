import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_STATIC = path.resolve(__dirname, "..", "static");

function mimeForFile(file: string): string {
  const ext = path.extname(file).toLowerCase();
  const m: Record<string, string> = {
    ".svg": "image/svg+xml",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
  };
  return m[ext] ?? "application/octet-stream";
}

/** Без Flask dev-сервер не отдавал /static → битый логотип и фото */
function serveRepoStatic(): Plugin {
  return {
    name: "serve-repo-static",
    enforce: "pre",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url?.split("?")[0];
        if (!raw?.startsWith("/static/")) {
          next();
          return;
        }
        let rel = raw.slice("/static/".length);
        try {
          rel = decodeURIComponent(rel);
        } catch {
          next();
          return;
        }
        if (rel.includes("..") || path.isAbsolute(rel)) {
          next();
          return;
        }
        const file = path.resolve(REPO_STATIC, rel);
        if (!file.startsWith(REPO_STATIC + path.sep) && file !== REPO_STATIC) {
          next();
          return;
        }
        if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
          next();
          return;
        }
        res.setHeader("Content-Type", mimeForFile(file));
        fs.createReadStream(file).pipe(res);
      });
    },
  };
}

/** /favicon.ico без файла — иначе глобус во вкладке при npm run dev */
function faviconIcoFromSvg(): Plugin {
  return {
    name: "favicon-ico-from-svg",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0];
        if (url === "/favicon.ico") {
          const svg = path.join(__dirname, "public", "favicon.svg");
          if (fs.existsSync(svg)) {
            res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
            res.end(fs.readFileSync(svg));
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), serveRepoStatic(), faviconIcoFromSvg()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://127.0.0.1:5000", changeOrigin: true },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
