import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const file = path.join(
  "public/images/articles",
  "ai-in-india-market-statistics-2026.webp",
);
const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#DC2626"/><stop offset="100%" stop-color="#0A0A0A"/>
  </linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="56" y="300" fill="#FAFAFA" font-family="Segoe UI" font-size="44" font-weight="700">AI in India Statistics 2026</text>
  <text x="56" y="360" fill="#FCA5A5" font-family="Segoe UI" font-size="28">50 key data points</text>
</svg>`);
await sharp(svg).webp({ quality: 78 }).toFile(file);
console.log("hero ok", file);

let doubles = 0;
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (name.endsWith(".mdx")) {
      let c = fs.readFileSync(p, "utf8");
      if (c.includes("/data/data/")) {
        c = c.replaceAll("/data/data/", "/data/");
        fs.writeFileSync(p, c);
        doubles++;
        console.log("fixed", p);
      }
    }
  }
}
walk("content");
console.log("double-data fixes:", doubles);

const count = [];
walkCount("content");
function walkCount(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walkCount(p);
    else if (name.endsWith(".mdx")) count.push(p);
  }
}
console.log("mdx files:", count.length);
count.sort().forEach((p) => console.log(" -", p.replaceAll("\\\\", "/")));
