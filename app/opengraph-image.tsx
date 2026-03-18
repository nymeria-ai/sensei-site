// Static OG image — served from public/og-image.jpg
// Next.js auto-detects this file and uses it for og:image meta tags
import { readFileSync } from "fs";
import { join } from "path";

export const alt = "Sensei — The open-source qualification engine for AI agents";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

export default function Image() {
  const imageBuffer = readFileSync(join(process.cwd(), "public/og-image.jpg"));
  return new Response(imageBuffer, {
    headers: { "Content-Type": "image/jpeg" },
  });
}
