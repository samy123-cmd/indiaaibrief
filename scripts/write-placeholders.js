const fs = require("fs");
const path = require("path");

// Minimal valid WebP (1×1) — used as placeholder until real article art ships.
const webp = Buffer.from(
  "UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=",
  "base64",
);

const targets = [
  "public/images/articles/placeholder.webp",
  "public/images/authors/placeholder.webp",
];

for (const target of targets) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, webp);
  console.log("wrote", target);
}
