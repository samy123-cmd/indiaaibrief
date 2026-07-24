import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const imgDir = path.join(root, "public/images/products");
const dlDir = path.join(root, "public/downloads/ai-compliance");
fs.mkdirSync(imgDir, { recursive: true });
fs.mkdirSync(dlDir, { recursive: true });

const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#DC2626"/><stop offset="100%" stop-color="#0A0A0A"/></linearGradient></defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="64" y="280" fill="#FAFAFA" font-family="Segoe UI, Arial" font-size="44" font-weight="700">AI Compliance Starter Kit</text>
  <text x="64" y="340" fill="#FCA5A5" font-family="Segoe UI, Arial" font-size="26">Playbook + 47-point checklist + workspace · INR 999</text>
  <text x="64" y="520" fill="#A3A3A3" font-family="Segoe UI, Arial" font-size="20">indiaaibrief.com</text>
</svg>`);

await sharp(svg)
  .webp({ quality: 80 })
  .toFile(path.join(imgDir, "ai-compliance-kit.webp"));

/** Minimal multi-page PDF with Helvetica text (cover + TOC + summary). Full playbook ships as .md */
function escapePdf(text) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function pageStream(lines, startY = 720) {
  const ops = ["BT /F1 11 Tf 50 " + startY + " Td"];
  lines.forEach((line, i) => {
    if (i === 0) {
      ops.push(`(${escapePdf(line)}) Tj`);
    } else {
      ops.push(`0 -16 Td (${escapePdf(line)}) Tj`);
    }
  });
  ops.push("ET");
  return ops.join("\n");
}

const pages = [
  pageStream(
    [
      "AI Compliance Starter Kit for Indian MSMEs",
      "IndiaAIBrief  |  Version 1.0  |  indiaaibrief.com",
      "",
      "This PDF is the executive cover. Your full pack is on the download page:",
      "  1. ai-compliance-playbook.md  — India-first operating playbook",
      "  2. ai-compliance-checklist.md — 47 controls before a pilot",
      "  3. workspace-template.md     — inventory / vendor / escalation boards",
      "",
      "Direct answer: before a BFSI, health, or government AI pilot you need a",
      "data purpose map (DPDP), a risk tier + human oversight path, and a vendor",
      "/ hosting memo buyers can attach to an RFP. This kit is the shortest path.",
      "",
      "Not legal advice. Practical hygiene for MSMEs under ~INR 50L ARR.",
    ],
    740,
  ),
  pageStream(
    [
      "Contents (full detail in Markdown playbook)",
      "",
      "1. India-first stack of seven questions",
      "2. DPDP-aware data practices — inventory, purpose, cross-border, logs",
      "3. Risk tiers in buyer language (unacceptable / high / limited / minimal)",
      "4. Human oversight pattern — trigger, queue, override, record, appeal",
      "5. Vendor diligence for Indian SaaS reality",
      "6. RFP response pack — five artefacts that win deals",
      "7. 30-day implementation sequence",
      "8. Contrarian note — artefacts beat accuracy theatre",
      "",
      "Print the checklist. Import the workspace template into Notion or Sheets.",
      "Questions: hello@indiaaibrief.com",
    ],
    740,
  ),
];

const objects = [];
objects.push("<< /Type /Catalog /Pages 2 0 R >>");
objects.push(
  `<< /Type /Pages /Kids [${pages.map((_, i) => `${3 + i * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`,
);

const fontObjNum = 3 + pages.length * 2;
pages.forEach((content, i) => {
  const pageNum = 3 + i * 2;
  const contentNum = pageNum + 1;
  objects.push(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentNum} 0 R /Resources<< /Font<< /F1 ${fontObjNum} 0 R >> >> >>`,
  );
  objects.push(`<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`);
});
objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

let pdf = "%PDF-1.4\n";
const offsets = [0];
objects.forEach((obj, i) => {
  offsets.push(Buffer.byteLength(pdf, "utf8"));
  pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
});
const xrefStart = Buffer.byteLength(pdf, "utf8");
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += "0000000000 65535 f \n";
for (let i = 1; i < offsets.length; i++) {
  pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

fs.writeFileSync(path.join(dlDir, "ai-compliance-playbook.pdf"), pdf);
console.log("kit assets ok (image + pdf cover; markdown files are source of truth)");
