/**
 * Generate branded 1200×630 Open Graph / hero images for every MDX article,
 * plus author monograms and the kit product card.
 *
 * Usage: node scripts/generate-og-images.mjs
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentRoot = path.join(root, "content");
const articlesDir = path.join(root, "public/images/articles");
const authorsDir = path.join(root, "public/images/authors");
const productsDir = path.join(root, "public/images/products");

fs.mkdirSync(articlesDir, { recursive: true });
fs.mkdirSync(authorsDir, { recursive: true });
fs.mkdirSync(productsDir, { recursive: true });

const CATEGORY_THEME = {
  news: { accent: "#DC2626", soft: "#F87171", label: "News" },
  explains: { accent: "#EA580C", soft: "#FDBA74", label: "Explains" },
  compares: { accent: "#B91C1C", soft: "#FCA5A5", label: "Compares" },
  playbooks: { accent: "#991B1B", soft: "#F87171", label: "Playbooks" },
  data: { accent: "#7F1D1D", soft: "#FCA5A5", label: "Data" },
};

function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapTitle(title, maxChars = 28, maxLines = 4) {
  const words = title.replace(/\s+/g, " ").trim().split(" ");
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
      if (lines.length >= maxLines) break;
    } else {
      current = next;
    }
  }

  if (lines.length < maxLines && current) lines.push(current);

  if (lines.length === maxLines) {
    const used = lines.join(" ").length;
    if (used < title.length) {
      const last = lines[maxLines - 1];
      lines[maxLines - 1] =
        last.length > 3 ? `${last.slice(0, Math.max(0, last.length - 1)).trimEnd()}…` : `${last}…`;
    }
  }

  return lines;
}

function hashHue(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const block = match[1];
  const get = (key) => {
    const m = block.match(new RegExp(`^${key}:\\s*"([^"]*)"`, "m"));
    return m ? m[1] : null;
  };
  return {
    title: get("title"),
    category: get("category"),
    image: get("image"),
  };
}

function walkMdx(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walkMdx(full, out);
    else if (name.endsWith(".mdx")) out.push(full);
  }
  return out;
}

function ogSvg({ title, category, slug }) {
  const theme = CATEGORY_THEME[category] ?? CATEGORY_THEME.explains;
  const lines = wrapTitle(title, 30, 4);
  const hue = hashHue(slug);
  const patternOffset = (hue % 40) + 10;
  const orbX = 980 + (hue % 80);
  const orbY = 120 + (hue % 60);

  const titleTspans = lines
    .map((line, i) => {
      const dy = i === 0 ? 0 : 58;
      return `<tspan x="72" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join("");

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A0A0A"/>
      <stop offset="55%" stop-color="#111111"/>
      <stop offset="100%" stop-color="#1A0505"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${theme.accent}"/>
      <stop offset="100%" stop-color="#450A0A"/>
    </linearGradient>
    <radialGradient id="glow" cx="85%" cy="20%" r="45%">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#0A0A0A" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="${patternOffset}" height="${patternOffset}" patternUnits="userSpaceOnUse">
      <path d="M ${patternOffset} 0 L 0 0 0 ${patternOffset}" fill="none" stroke="#FFFFFF" stroke-opacity="0.04" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- left accent rail -->
  <rect x="0" y="0" width="10" height="630" fill="url(#accentGrad)"/>

  <!-- decorative orb -->
  <circle cx="${orbX}" cy="${orbY}" r="180" fill="${theme.accent}" fill-opacity="0.08"/>
  <circle cx="${orbX - 40}" cy="${orbY + 80}" r="90" fill="${theme.soft}" fill-opacity="0.06"/>

  <!-- brand mark block -->
  <g transform="translate(1050, 470)">
    <rect width="88" height="88" rx="18" fill="#0A0A0A" stroke="#262626" stroke-width="2"/>
    <g fill="none" stroke="#FAFAFA" stroke-width="5" stroke-linecap="round">
      <path d="M18 30 H52"/>
      <path d="M18 44 H58"/>
      <path d="M18 58 H48"/>
    </g>
    <rect x="50" y="18" width="7" height="52" rx="2" fill="${theme.accent}"/>
    <circle cx="53.5" cy="16" r="5" fill="${theme.accent}"/>
  </g>

  <!-- category -->
  <text x="72" y="88" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="4" fill="${theme.accent}">
    ${escapeXml(theme.label.toUpperCase())}
  </text>

  <!-- title -->
  <text x="72" y="180" font-family="Segoe UI, Arial, sans-serif" font-size="48" font-weight="800" letter-spacing="-1.2" fill="#FAFAFA">
    ${titleTspans}
  </text>

  <!-- bottom rule + brand -->
  <rect x="72" y="520" width="160" height="3" fill="${theme.accent}"/>
  <text x="72" y="568" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="800" letter-spacing="-0.5">
    <tspan fill="#FAFAFA">India</tspan><tspan fill="${theme.accent}">AI</tspan><tspan fill="#FAFAFA">Brief</tspan>
  </text>
  <text x="72" y="598" font-family="Segoe UI, Arial, sans-serif" font-size="16" fill="#A3A3A3">
    Indian AI intelligence for decision-makers
  </text>
</svg>`);
}

function avatarSvg({ initials, accent, label }) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="a" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#171717"/>
      <stop offset="100%" stop-color="#0A0A0A"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="48" fill="url(#a)"/>
  <rect x="8" y="8" width="240" height="240" rx="40" fill="none" stroke="${accent}" stroke-width="4" stroke-opacity="0.7"/>
  <text x="128" y="148" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="84" font-weight="800" fill="#FAFAFA">${escapeXml(initials)}</text>
  <text x="128" y="210" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="600" letter-spacing="2" fill="${accent}">${escapeXml(label)}</text>
</svg>`);
}

function productSvg() {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A0A0A"/>
      <stop offset="100%" stop-color="#450A0A"/>
    </linearGradient>
    <radialGradient id="glow" cx="70%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#DC2626" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#0A0A0A" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="0" y="0" width="10" height="630" fill="#DC2626"/>
  <text x="72" y="100" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="4" fill="#F87171">DIGITAL PRODUCT · ₹999</text>
  <text x="72" y="200" font-family="Segoe UI, Arial, sans-serif" font-size="52" font-weight="800" fill="#FAFAFA">AI Compliance</text>
  <text x="72" y="265" font-family="Segoe UI, Arial, sans-serif" font-size="52" font-weight="800" fill="#FAFAFA">Starter Kit</text>
  <text x="72" y="330" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="#A3A3A3">Playbook · 47-point checklist · Workspace</text>
  <rect x="72" y="380" width="200" height="3" fill="#DC2626"/>
  <text x="72" y="440" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="800">
    <tspan fill="#FAFAFA">India</tspan><tspan fill="#DC2626">AI</tspan><tspan fill="#FAFAFA">Brief</tspan>
  </text>
</svg>`);
}

function defaultOgSvg() {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#070707"/>
      <stop offset="100%" stop-color="#1A0505"/>
    </linearGradient>
    <radialGradient id="glow" cx="70%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#DC2626" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#070707" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="0" y="0" width="10" height="630" fill="#DC2626"/>
  <g transform="translate(120,200)">
    <rect width="160" height="160" rx="36" fill="#0A0A0A" stroke="#262626" stroke-width="3"/>
    <g fill="none" stroke="#FAFAFA" stroke-width="9" stroke-linecap="round">
      <path d="M32 52 H92"/><path d="M32 80 H108"/><path d="M32 108 H84"/>
    </g>
    <rect x="92" y="36" width="12" height="96" rx="4" fill="#DC2626"/>
    <circle cx="98" cy="32" r="9" fill="#DC2626"/>
  </g>
  <text x="340" y="290" font-family="Segoe UI, Arial, sans-serif" font-size="64" font-weight="800" letter-spacing="-1.5">
    <tspan fill="#FAFAFA">India</tspan><tspan fill="#DC2626">AI</tspan><tspan fill="#FAFAFA">Brief</tspan>
  </text>
  <text x="340" y="350" font-family="Segoe UI, Arial, sans-serif" font-size="26" fill="#A3A3A3">Indian AI intelligence for decision-makers</text>
  <rect x="340" y="390" width="240" height="3" fill="#DC2626"/>
</svg>`);
}

async function writeWebp(svg, outPath, quality = 84) {
  await sharp(svg).webp({ quality }).toFile(outPath);
}

const files = walkMdx(contentRoot);
let wrote = 0;
const missing = [];

for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  const fm = parseFrontmatter(raw);
  if (!fm?.title || !fm.image || !fm.category) {
    missing.push(file);
    continue;
  }

  const resolved = path.join(root, "public", fm.image.replace(/^\//, ""));
  fs.mkdirSync(path.dirname(resolved), { recursive: true });

  const slug = path.basename(fm.image, ".webp");
  const svg = ogSvg({
    title: fm.title,
    category: fm.category,
    slug,
  });
  await writeWebp(svg, resolved);
  wrote++;
  console.log("og", path.relative(root, resolved));
}

// Shared article placeholder (editorial drafts)
await writeWebp(
  ogSvg({
    title: "IndiaAIBrief — Indian AI intelligence",
    category: "explains",
    slug: "placeholder",
  }),
  path.join(articlesDir, "placeholder.webp"),
);

await writeWebp(defaultOgSvg(), path.join(root, "public/images/og-default.webp"), 86);
console.log("og public/images/og-default.webp");

await writeWebp(productSvg(), path.join(productsDir, "ai-compliance-kit.webp"), 86);
console.log("og public/images/products/ai-compliance-kit.webp");

await writeWebp(
  avatarSvg({ initials: "AN", accent: "#DC2626", label: "INTEL" }),
  path.join(authorsDir, "arjun-nair.webp"),
  90,
);
await writeWebp(
  avatarSvg({ initials: "IAB", accent: "#F87171", label: "DESK" }),
  path.join(authorsDir, "indiaaibrief-desk.webp"),
  90,
);
await writeWebp(
  avatarSvg({ initials: "?", accent: "#525252", label: "AUTHOR" }),
  path.join(authorsDir, "placeholder.webp"),
  90,
);
console.log("avatars updated");

console.log(`\nDone. Regenerated ${wrote} article OG images.`);
if (missing.length) {
  console.log("Skipped (incomplete frontmatter):");
  missing.forEach((f) => console.log(" -", f));
}
