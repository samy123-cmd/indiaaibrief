import fs from "fs";
import path from "path";
import { isHtmlBody, sanitizeArticleHtml } from "../src/lib/content/htmlBody";

function fixFile(file: string) {
  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as Array<{ body?: string }>;
  let n = 0;
  for (const row of raw) {
    if (!row.body || !isHtmlBody(row.body)) continue;
    const next = sanitizeArticleHtml(row.body);
    if (next !== row.body) {
      row.body = next;
      n++;
    }
  }
  fs.writeFileSync(file, JSON.stringify(raw, null, 2) + "\n");
  console.log(path.basename(file), "normalized", n);
}

const root = path.resolve(__dirname, "..", "src", "content", "data");
fixFile(path.join(root, "stories.json"));
fixFile(path.join(root, "articles.json"));
