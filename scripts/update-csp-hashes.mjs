// Scans dist/ for inline <script> tags, computes their sha256 hashes,
// and writes dist/_headers with a Content-Security-Policy that matches
// the just-built output. Netlify reads _headers from the publish dir
// after the build, so hashes are guaranteed to match the deployed HTML.

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, appendFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");
const headersPath = join(distDir, "_headers");

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

const csp = [
  "default-src 'none'",
  `script-src 'self' ${sorted.join(" ")} https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline' https://use.typekit.net https://p.typekit.net",
  "img-src 'self' https://cdn.sanity.io https://www.googletagmanager.com https://www.google-analytics.com data:",
  "font-src 'self' https://use.typekit.net https://p.typekit.net",
  "connect-src 'self' https://www.google-analytics.com https://*.analytics.google.com https://*.google-analytics.com",
  "media-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "manifest-src 'self'",
].join("; ");

const block = `
/*
  Content-Security-Policy: ${csp}
`;

// Append (don't overwrite) so any future _headers entries Astro emits survive.
if (existsSync(headersPath)) {
  appendFileSync(headersPath, block);
} else {
  writeFileSync(headersPath, block.trimStart());
}

console.log(`update-csp-hashes: wrote dist/_headers CSP with ${sorted.length} inline-script hashes`);
for (const h of sorted) console.log("  " + h);
