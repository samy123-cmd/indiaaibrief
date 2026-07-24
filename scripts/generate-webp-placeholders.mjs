import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const articlesDir = path.join(root, "public/images/articles");
const authorsDir = path.join(root, "public/images/authors");
fs.mkdirSync(articlesDir, { recursive: true });
fs.mkdirSync(authorsDir, { recursive: true });

async function solid(file, w, h, color, label) {
  const fontSize = w >= 600 ? 42 : 22;
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${color}"/>
          <stop offset="100%" stop-color="#0A0A0A"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="${Math.round(w * 0.04)}" y="${Math.round(h * 0.55)}" fill="#FAFAFA" font-family="Segoe UI, Arial, sans-serif" font-size="${fontSize}" font-weight="700">${label}</text>
    </svg>`,
  );
  await sharp(svg).webp({ quality: 80 }).toFile(file);
  console.log("wrote", file);
}

await solid(
  path.join(articlesDir, "meity-governance.webp"),
  1200,
  630,
  "#DC2626",
  "MeitY AI Governance",
);
await solid(
  path.join(articlesDir, "ai-funding-q2.webp"),
  1200,
  630,
  "#B91C1C",
  "Indian AI Funding Q2",
);
await solid(
  path.join(articlesDir, "dpdp-training.webp"),
  1200,
  630,
  "#7F1D1D",
  "DPDP x AI Training",
);
await solid(
  path.join(articlesDir, "placeholder.webp"),
  1200,
  630,
  "#262626",
  "IndiaAIBrief",
);
await solid(
  path.join(authorsDir, "indiaaibrief-desk.webp"),
  96,
  96,
  "#DC2626",
  "IAB",
);
await solid(
  path.join(authorsDir, "placeholder.webp"),
  96,
  96,
  "#525252",
  "A",
);
