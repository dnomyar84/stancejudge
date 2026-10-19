import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGitHubPages ? "/stancejudge" : "";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const mannequinSceneStub = path.join(
  rootDir,
  "src/lib/pose/mannequin-adapter/scene-stub.ts",
);
const mannequinSceneModule = path.join(
  rootDir,
  "node_modules/mannequin-js/src/scene.js",
);

const nextConfig: NextConfig = {
  // Static export only for GitHub Pages; local `npm run dev` keeps /api/youtube working.
  ...(isGitHubPages ? { output: "export" as const } : {}),
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: { unoptimized: true },
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
    resolveAlias: {
      "mannequin-js/src/scene.js": mannequinSceneStub,
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "mannequin-js/src/scene.js": mannequinSceneStub,
      [mannequinSceneModule]: mannequinSceneStub,
    };
    return config;
  },
};

export default nextConfig;
