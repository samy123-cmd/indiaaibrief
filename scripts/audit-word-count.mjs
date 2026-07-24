#!/usr/bin/env node
/**
 * Enforce minimum article word counts (AdSense / thin-content bar).
 *
 *   node scripts/audit-word-count.mjs
 *   MIN_WORDS=500 node scripts/audit-word-count.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "content");
const MIN_WORDS = Number(process.env.MIN_WORDS || 300);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".mdx")) out.push(full);
  }
  return out;
}

function wordCount(raw) {
  const body = raw.replace(/^---[\s\S]*?---\s*/, "");
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_`[\]()!-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

const files = walk(ROOT);
const rows = files
  .map((file) => {
    const words = wordCount(fs.readFileSync(file, "utf8"));
    return {
      file: path.relative(ROOT, file).replace(/\\/g, "/"),
      words,
    };
  })
  .sort((a, b) => a.words - b.words);

const failing = rows.filter((r) => r.words < MIN_WORDS);

console.log(`Articles: ${rows.length}`);
console.log(`Min words required: ${MIN_WORDS}`);
console.log(`Shortest: ${rows[0]?.words} (${rows[0]?.file})`);
console.log(`Longest: ${rows[rows.length - 1]?.words} (${rows[rows.length - 1]?.file})`);
console.log(
  `Average: ${Math.round(rows.reduce((s, r) => s + r.words, 0) / rows.length)}`,
);

if (failing.length) {
  console.error(`\nFAIL — ${failing.length} under ${MIN_WORDS} words:`);
  for (const row of failing) {
    console.error(`  ${row.words}\t${row.file}`);
  }
  process.exit(1);
}

console.log(`\nPASS — all articles ≥ ${MIN_WORDS} words.`);
