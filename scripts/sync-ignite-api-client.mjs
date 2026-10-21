#!/usr/bin/env node
/**
 * Copy public-api/typescript into vendor/ignite-api-client for local monorepo installs.
 * In the mirrored ignite-mobile repo the vendor tree is already present and the
 * monorepo path does not exist — this script is a no-op then.
 *
 * Also refreshes node_modules/@ignite/api-client (the installed copy of the
 * `file:` dependency) so the two copies can never drift: vendor is the single
 * source of truth, node_modules is a plain mirror that is re-synced here.
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dest = join(root, "vendor/ignite-api-client");
const src = join(root, "../../public-api/typescript");

/** Copy a package tree, skipping node_modules and dist (keep sources + config). */
function copyPackage(source, target) {
  rmSync(target, { recursive: true, force: true });
  cpSync(source, target, {
    recursive: true,
    filter: (path) => {
      const normalized = path.replaceAll("\\", "/");
      return !normalized.includes("/node_modules") && !normalized.includes("/dist/") && !normalized.endsWith("/dist");
    },
  });
}

if (!existsSync(src)) {
  if (!existsSync(join(dest, "package.json"))) {
    console.error("[sync-ignite-api-client] vendor/ignite-api-client is missing and public-api/typescript was not found.");
    process.exit(1);
  }
  console.log("[sync-ignite-api-client] monorepo public-api/typescript not found — vendor already present, keeping it.");
  process.exit(0);
}

mkdirSync(join(root, "vendor"), { recursive: true });
copyPackage(src, dest);
console.log("[sync-ignite-api-client] updated vendor/ignite-api-client");

// Mirror into the installed file: dependency so `bunx tsc` and builds always
// see the same source as vendor (prevents the two from drifting).
const installed = join(root, "node_modules/@ignite/api-client");
if (existsSync(installed)) {
  copyPackage(dest, installed);
  console.log("[sync-ignite-api-client] refreshed node_modules/@ignite/api-client");
}
