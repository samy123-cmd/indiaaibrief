import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { verifyDownloadToken } from "@/lib/payments";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-guards";

const ALLOWED_FILES: Record<string, Record<string, string>> = {
  "ai-compliance": {
    "ai-compliance-playbook.md": "text/markdown; charset=utf-8",
    "ai-compliance-playbook.pdf": "application/pdf",
    "ai-compliance-checklist.md": "text/markdown; charset=utf-8",
    "workspace-template.md": "text/markdown; charset=utf-8",
  },
};

interface RouteParams {
  params: Promise<{ product: string; file: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { product, file } = await params;
  const url = new URL(request.url);
  const orderId = url.searchParams.get("order_id") ?? "";
  const paymentId = url.searchParams.get("payment_id") ?? "";
  const token = url.searchParams.get("token") ?? "";

  const ip = clientIp(request);
  const limited = rateLimit({
    key: `download:${ip}`,
    limit: 60,
    windowMs: 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many download requests." },
      { status: 429 },
    );
  }

  const productFiles = ALLOWED_FILES[product];
  if (!productFiles || !productFiles[file]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Path traversal guard
  if (file.includes("..") || file.includes("/") || file.includes("\\")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const authorized = verifyDownloadToken({
    product,
    orderId,
    paymentId,
    token,
  });
  if (!authorized) {
    return NextResponse.json(
      { error: "Valid purchase token required" },
      { status: 401 },
    );
  }

  const absolute = path.join(
    process.cwd(),
    "private",
    "downloads",
    product,
    file,
  );

  try {
    const data = await readFile(absolute);
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": productFiles[file],
        "Content-Disposition": `attachment; filename="${file}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    console.error("[downloads] missing file", absolute);
    return NextResponse.json(
      { error: "File unavailable. Email hello@indiaaibrief.com." },
      { status: 500 },
    );
  }
}
