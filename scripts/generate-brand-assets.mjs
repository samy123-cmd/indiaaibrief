import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const images = path.join(root, "public/images");
const appDir = path.join(root, "app");
const assets = path.join(
  process.env.USERPROFILE || process.env.HOME || "",
  ".cursor",
  "projects",
  "c-Users-pmish-Downloads-indiaaibrief",
  "assets",
);

const markSvg = fs.readFileSync(path.join(images, "logo-mark.svg"));

async function fromSvg(svg, out, w, h) {
  await sharp(svg).resize(w, h).png().toFile(out);
  console.log("wrote", path.relative(root, out));
}

async function fromSvgWebp(svg, out, w, h) {
  await sharp(svg).resize(w, h).webp({ quality: 90 }).toFile(out);
  console.log("wrote", path.relative(root, out));
}

// App / schema logo.png (512)
await fromSvg(markSvg, path.join(images, "logo.png"), 512, 512);
await fromSvg(markSvg, path.join(images, "logo-192.png"), 192, 192);
await fromSvg(markSvg, path.join(images, "logo-32.png"), 32, 32);

// Favicon.ico from 32+16
const png32 = await sharp(markSvg).resize(32, 32).png().toBuffer();
await sharp(png32).toFile(path.join(appDir, "favicon.ico"));
console.log("wrote app/favicon.ico");

await fromSvg(markSvg, path.join(appDir, "icon.png"), 512, 512);
await fromSvg(markSvg, path.join(appDir, "apple-icon.png"), 180, 180);

// OG default from concept if present, else synthesize
const ogConcept = path.join(assets, "og-default-concept.png");
const ogOut = path.join(images, "og-default.webp");
if (fs.existsSync(ogConcept)) {
  await sharp(ogConcept)
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .webp({ quality: 82 })
    .toFile(ogOut);
  console.log("wrote", path.relative(root, ogOut), "(from concept)");
} else {
  // Fallback synthetic OG
  const ogSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect width="1200" height="630" fill="#070707"/>
    <g transform="translate(80,180)">
      <rect width="200" height="200" rx="44" fill="#0A0A0A" stroke="#1f1f1f"/>
      <g fill="none" stroke="#F5F5F5" stroke-width="11" stroke-linecap="round">
        <path d="M38 66 H116"/><path d="M38 100 H132"/><path d="M38 134 H108"/>
      </g>
      <rect x="114" y="38" width="16" height="124" rx="5" fill="#DC2626"/>
      <circle cx="122" cy="32" r="11" fill="#DC2626"/>
    </g>
    <text x="320" y="290" font-family="Segoe UI, Arial, sans-serif" font-size="72" font-weight="800" letter-spacing="-2">
      <tspan fill="#FAFAFA">India</tspan><tspan fill="#DC2626">AI</tspan><tspan fill="#FAFAFA">Brief</tspan>
    </text>
    <text x="320" y="350" font-family="Segoe UI, Arial, sans-serif" font-size="28" fill="#878787">Indian AI intelligence for decision-makers.</text>
    <rect x="320" y="380" width="280" height="3" fill="#DC2626"/>
  </svg>`);
  await sharp(ogSvg).webp({ quality: 85 }).toFile(ogOut);
  console.log("wrote", path.relative(root, ogOut), "(synthetic)");
}

const pressKit = path.join(root, "public/press-kit");
for (const file of [
  "logo-mark.svg",
  "logo.svg",
  "logo-lockup.svg",
  "logo-lockup-dark.svg",
]) {
  fs.copyFileSync(path.join(images, file), path.join(pressKit, file));
  console.log("synced press-kit/", file);
}

// Copy mark concept into press kit as reference PNG
const markConcept = path.join(assets, "logo-mark-concept.png");
if (fs.existsSync(markConcept)) {
  await sharp(markConcept)
    .resize(1024, 1024, { fit: "cover" })
    .png()
    .toFile(path.join(pressKit, "logo-mark-render.png"));
  console.log("wrote press-kit/logo-mark-render.png");
} else {
  await fromSvg(markSvg, path.join(pressKit, "logo-mark-render.png"), 1024, 1024);
}

console.log("Brand assets ready.");
