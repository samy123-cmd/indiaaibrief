import sharp from "sharp";
import path from "node:path";

const dir = path.join(process.cwd(), "public/images/articles");

async function solid(file, color, label) {
  const w = 1200;
  const h = 630;
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${color}"/>
          <stop offset="100%" stop-color="#070707"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <text x="48" y="340" fill="#FAFAFA" font-family="Segoe UI, Arial, sans-serif" font-size="42" font-weight="700">${label}</text>
    </svg>`,
  );
  await sharp(svg).webp({ quality: 80 }).toFile(path.join(dir, file));
  console.log("wrote", file);
}

await solid(
  "claude-vs-gpt-indian-enterprises.webp",
  "#DC2626",
  "Claude vs GPT — India",
);
await solid(
  "yellow-ai-vs-observe-ai.webp",
  "#B91C1C",
  "Yellow.ai vs Observe.AI",
);
