import { archiveAssets, catalogue } from "@/lib/catalogue";
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = (params.get("q") ?? "").trim().toLowerCase();
  const category = params.get("category");
  const network = params.get("network");
  const issuer = params.get("issuer");
  const source = params.get("source");
  const limitText = params.get("limit") ?? "24";
  const offsetText = params.get("offset") ?? "0";
  if (!/^\d+$/.test(limitText) || !/^\d+$/.test(offsetText)) return Response.json({error:"limit and offset must be whole non-negative numbers"},{status:400});
  const limit = Number(limitText);
  const offset = Number(offsetText);
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100 || !Number.isSafeInteger(offset)) return Response.json({error:"limit must be 1–100 and offset must be a safe non-negative integer"},{status:400});
  const filtered = archiveAssets.filter((asset) => (!category || category === "all" || asset.category === category) && (!network || network === "all" || asset.chain === network) && (!issuer || issuer === "all" || asset.issuer === issuer) && (!source || source === "all" || (asset.priceSource ?? "unknown") === source) && (!query || [asset.name,asset.symbol,asset.issuer,asset.slug].some((value) => value.toLowerCase().includes(query))));
  return Response.json({snapshotAt:catalogue.snapshotAt,mode:"archive",total:filtered.length,limit,offset,assets:filtered.slice(offset,offset + limit)});
}
