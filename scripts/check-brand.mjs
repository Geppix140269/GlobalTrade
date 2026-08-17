/**
 * Brand guard.
 *
 * Ponte Brand Identity v1 binds one rule above the others: the mark is
 * REFERENCED, never drawn. A second copy of the geometry in source is how a
 * brand stops being one — the copy drifts, and nobody notices until two
 * surfaces disagree.
 *
 * This fails the build if the arch path, the deck line or the keystone
 * appears anywhere in source, or if an exported asset under `public/brand/`
 * has been edited so that it no longer matches the frozen drawing.
 *
 * Run with: npm run check:brand
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();

/** The signatures of the frozen mark. None may appear in source. */
const GEOMETRY = [
  "M22 98 L22 60", // the arch
  'x1="12" y1="98" x2="108" y2="98"', // the deck line
  'cx="60" cy="41" r="10"', // the keystone
];

/** The exported assets that must still carry the drawing unaltered. */
const REQUIRED_ASSETS = {
  "public/brand/ponte-mark.svg": ["M22 98 L22 60", "#C9973A"],
  "public/brand/ponte-mark-reversed.svg": ["M22 98 L22 60", "#D9AC55"],
  "src/app/icon.svg": ["M22 98 L22 60", "#C9973A"],
};

const SOURCE_DIRS = ["src", "scripts", "prisma", "tests"];
const SOURCE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".css"]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (SOURCE_EXT.has(extname(entry))) out.push(full);
  }
  return out;
}

const failures = [];

for (const dir of SOURCE_DIRS) {
  let files = [];
  try {
    files = walk(join(ROOT, dir));
  } catch {
    continue;
  }
  for (const file of files) {
    // This file names the geometry in order to forbid it.
    if (file.endsWith("check-brand.mjs")) continue;
    const text = readFileSync(file, "utf8");
    for (const sig of GEOMETRY) {
      if (text.includes(sig)) {
        failures.push(
          `${file.replace(ROOT + "/", "")} contains the mark's geometry. ` +
            `The mark is referenced, never drawn — load it from public/brand/ ` +
            `through src/components/BrandMark.tsx instead.`,
        );
      }
    }
  }
}

for (const [asset, mustContain] of Object.entries(REQUIRED_ASSETS)) {
  let text;
  try {
    text = readFileSync(join(ROOT, asset), "utf8");
  } catch {
    failures.push(`${asset} is missing. The exported brand assets are required.`);
    continue;
  }
  for (const needle of mustContain) {
    if (!text.includes(needle)) {
      failures.push(`${asset} no longer contains ${needle} — the exported asset has been altered.`);
    }
  }
}

if (failures.length > 0) {
  console.error("Brand check failed:\n");
  for (const f of failures) console.error("  • " + f);
  process.exit(1);
}

console.log("Brand check passed: the mark is referenced, and the assets are intact.");
