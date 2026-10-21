#!/usr/bin/env node
/**
 * Keep the vendored @ignite/api-client in sync with the monorepo SDK.
 *
 * - In the monorepo, copy public-api/typescript into vendor/ignite-api-client.
 * - In the mirrored ignite-mobile repo, vendor/ is already committed; keep it.
 * - Ensure vendor/dist exists (Bun's browser build resolves the `import`
 *   condition to dist/index.js).
 * - Refresh node_modules/@ignite/api-client, including dist, so the installed
 *   `file:` dependency matches vendor.
 */
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dest = join(root, "vendor/ignite-api-client");
const src = join(root, "../../public-api/typescript");
const installed = join(root, "node_modules/@ignite/api-client");

/** Copy a package tree, skipping only generated dependency/build caches. */
function copyPackage(source, target) {
  rmSync(target, { recursive: true, force: true });
  cpSync(source, target, {
    recursive: true,
    filter: (path) => {
      const normalized = path.replaceAll("\\", "/");
      return (
        !normalized.includes("/node_modules") &&
        !normalized.includes("/.git/") &&
        !normalized.endsWith("/.git") &&
        !normalized.endsWith("/bun.lock") &&
        !normalized.endsWith(".tsbuildinfo")
      );
    },
  });
}

if (existsSync(src)) {
  mkdirSync(join(root, "vendor"), { recursive: true });
  copyPackage(src, dest);
  console.log("[sync-ignite-api-client] updated vendor/ignite-api-client from public-api/typescript");
} else if (!existsSync(join(dest, "package.json"))) {
  console.error("[sync-ignite-api-client] vendor/ignite-api-client is missing and public-api/typescript was not found.");
  process.exit(1);
} else {
  console.log("[sync-ignite-api-client] monorepo public-api/typescript not found — keeping vendored client");
}

// Bun.build targets the browser and resolves the package `import` condition to
// dist/index.js. A standalone checkout has no prebuilt dist, so build it here.
if (!existsSync(join(dest, "dist", "index.js"))) {
  try {
    console.log("[sync-ignite-api-client] building vendored API client (dist/)");
    execSync("bunx tsc -p .", { cwd: dest, stdio: "inherit" });
  } catch (error) {
    console.warn("[sync-ignite-api-client] could not build vendor dist:", error?.message ?? error);
  }
}

// Mirror into the installed file: dependency. The package export map points at
// dist/ for browser builds, so the compiled tree must travel with it.
if (existsSync(installed)) {
  copyPackage(dest, installed);
  console.log("[sync-ignite-api-client] refreshed node_modules/@ignite/api-client");
}
