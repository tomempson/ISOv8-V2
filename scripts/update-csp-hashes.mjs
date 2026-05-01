// Scans dist/ for inline <script> tags, computes their sha256 hashes,
// and rewrites the script-src directive in netlify.toml so the CSP
// always matches what was just built. Runs as a postbuild step.

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");
const tomlPath = join(root, "netlify.toml");

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else if (entry.endsWith(".html")) out.push(full);
  }
  return out;
}

const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/g;
const hashes = new Set();

for (const file of walk(distDir)) {
  const html = readFileSync(file, "utf8");
  let m;
  while ((m = scriptRe.exec(html)) !== null) {
    const attrs = m[1];
    const body = m[2];
    if (/\bsrc\s*=/.test(attrs)) continue;
    if (/type\s*=\s*["']application\/ld\+json["']/.test(attrs)) continue;
    if (body.trim() === "") continue;
    hashes.add("'sha256-" + createHash("sha256").update(body).digest("base64") + "'");
  }
}

const sorted = [...hashes].sort();
const toml = readFileSync(tomlPath, "utf8");

const updated = toml.replace(
  /(script-src\s+'self')([^;]*?)(\s+https:\/\/www\.googletagmanager\.com)/,
  (_, head, _middle, tail) => `${head} ${sorted.join(" ")}${tail}`,
);

if (updated === toml) {
  console.error("update-csp-hashes: failed to locate script-src directive in netlify.toml");
  process.exit(1);
}

writeFileSync(tomlPath, updated);
console.log(`update-csp-hashes: wrote ${sorted.length} inline-script hashes to netlify.toml`);
for (const h of sorted) console.log("  " + h);
