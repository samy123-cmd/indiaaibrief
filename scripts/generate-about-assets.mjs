import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const authors = path.join(process.cwd(), "public/images/authors");
const press = path.join(process.cwd(), "public/press-kit");
fs.mkdirSync(authors, { recursive: true });
fs.mkdirSync(press, { recursive: true });

async function avatar(file, color, letter) {
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">
    <rect width="96" height="96" rx="48" fill="${color}"/>
    <text x="48" y="58" text-anchor="middle" font-family="Segoe UI, Arial" font-size="36" font-weight="700" fill="#FAFAFA">${letter}</text>
  </svg>`);
  await sharp(svg).webp({ quality: 85 }).toFile(path.join(authors, file));
}

await avatar("shiv-shakti-mishra.webp", "#DC2626", "S");
await avatar("arjun-nair.webp", "#B91C1C", "A");

const colorsGuide = `# IndiaAIBrief Brand Colors

Light
- Background: #FAFAFA
- Surface: #FFFFFF
- Text Primary: #0A0A0A
- Text Secondary: #525252
- Accent: #DC2626

Dark
- Background: #0A0A0A
- Surface: #171717
- Text Primary: #FAFAFA
- Accent: #F87171

Accent usage: CTAs, category labels, links. Do not use purple gradients.
`;

fs.writeFileSync(path.join(press, "color-guidelines.txt"), colorsGuide);
fs.copyFileSync(
  path.join(process.cwd(), "public/images/logo.svg"),
  path.join(press, "logo.svg"),
);

const readme = `IndiaAIBrief Press Kit
- logo.svg — primary wordmark mark
- color-guidelines.txt — palette
Contact: press@indiaaibrief.com
`;
fs.writeFileSync(path.join(press, "README.txt"), readme);
console.log("press kit + team avatars ready");
