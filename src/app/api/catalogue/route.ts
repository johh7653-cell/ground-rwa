import { catalogue } from "@/lib/catalogue";
export function GET(request: Request) {
  const download = new URL(request.url).searchParams.get("download") === "1";
  return Response.json(catalogue, { headers: { "Cache-Control": "public, max-age=3600", ...(download ? { "Content-Disposition": "attachment; filename=ground-catalogue-2026-09-23.json" } : {}) } });
}
