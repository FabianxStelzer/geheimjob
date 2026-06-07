import { createReadStream, existsSync } from "fs";
import path from "path";
import { Readable } from "stream";

type Params = { params: Promise<{ userId: string; filename: string }> };

function contentType(filename: string) {
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

export async function GET(_req: Request, { params }: Params) {
  const { userId, filename } = await params;

  if (!/^[a-zA-Z0-9_-]+$/.test(userId) || !/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return new Response("Ungültiger Pfad.", { status: 400 });
  }

  const fp = path.join(process.cwd(), "public", "uploads", "employer", userId, filename);
  if (!existsSync(fp)) {
    return new Response("Nicht gefunden.", { status: 404 });
  }

  const stream = createReadStream(fp);
  const webStream = Readable.toWeb(stream) as ReadableStream;

  return new Response(webStream, {
    headers: {
      "Content-Type": contentType(filename),
      "Cache-Control": "public, max-age=86400",
    },
  });
}

export const runtime = "nodejs";
